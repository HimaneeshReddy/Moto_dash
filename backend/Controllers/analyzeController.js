import pool from "../config/db.js";
import format from "pg-format";

export const analyzeDataset = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;

    try {
        // 1. Fetch the dataset metadata
        const datasetQuery = await pool.query(`
            SELECT d.name, d.storage_table_name, d.showroom_id, dm.metadata
            FROM datasets d
            JOIN dataset_metadata dm ON d.id = dm.dataset_id
            WHERE d.id = $1 AND d.organization_id = $2
        `, [id, organizationId]);

        if (datasetQuery.rows.length === 0) {
            return res.status(404).json({ message: "Dataset not found or has no metadata." });
        }

        const { name, storage_table_name: storageTable, showroom_id: showroomId, metadata } = datasetQuery.rows[0];

        // 2. Compact column summary
        const columnSummary = (metadata.columns || []).map(col => {
            if (col.type === 'numeric') return `${col.name} (number, min=${col.min}, max=${col.max})`;
            if (col.type === 'date') return `${col.name} (date)`;
            const topVals = (col.unique_values || []).slice(0, 5).join(', ');
            return `${col.name} (text, e.g. ${topVals})`;
        }).join('\n');

        // 3. Prompt
        const systemPrompt = `You are a data analyst and financial classifier. Given a dataset, output EXACTLY 3 charts, EXACTLY 5 insights, and a financial classification as pure JSON.

RULES:
- Choose the most appropriate chart for the dataset and selected columns. Prefer the clearest chart, not the fanciest one.
- Only use chart types supported by our dashboard renderer:
    - bar: compare values across categories
    - line: show trends over time or ordered sequences
    - area: show trends over time with magnitude emphasis
    - pie: show part-to-whole breakdowns with a small number of categories
    - scatter: show correlation or relationship between two numeric variables
    - radar: compare multivariate profiles across a small number of categories
    - composed: combine bar and line style comparisons when both category comparison and trend/overlay matter
    - radialBar: show ranked progress or compact part-to-whole comparisons for a few categories
    - treemap: show hierarchical or many-category part-to-whole composition
- chart_type must be exactly one of: bar, line, area, pie, scatter, radar, composed, radialBar, treemap
- x_axis_column and y_axis_column must be exact column names from the dataset
- filters must be 3 exact column names most useful for filtering
- Each insight must state a specific, concrete fact (e.g. "Sales peak in Q4", "Average price is 450")
- dataset_type: "revenue", "expenditure", "salary", "mixed", or "other"
- dataset_type_label: short human-readable description e.g. "Vehicle Sales Report"
- financial_columns: list ONLY column names that actually appear in the columns list AND hold monetary/numeric amounts
- Use empty arrays [] when no matching financial columns exist
- Output pure JSON only, no markdown, no extra text

{
  "charts": [
    {"chart_type": "bar", "title": "...", "x_axis_column": "...", "y_axis_column": "...", "description": "..."}
  ],
  "filters": ["col1", "col2", "col3"],
  "insights": [
    {"type": "Insight", "description": "A specific fact about this data."}
  ],
  "dataset_type": "revenue",
  "dataset_type_label": "Vehicle Sales Report",
  "financial_columns": {
    "revenue": ["selling_price"],
    "expenditure": ["purchase_cost"],
    "salary": []
  }
}`;

        const prompt = `Dataset: "${name}" | Rows: ${metadata.row_count ?? 'unknown'}\n\nColumns:\n${columnSummary}\n\nGenerate 3 charts and 5 insights.`;

        // 4. Call Gemini API
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables.");
        }

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: systemPrompt + "\n\n" + prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 1200,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            throw new Error(`Gemini API returned status ${geminiResponse.status}: ${errText}`);
        }

        const geminiData = await geminiResponse.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error("Empty response from Gemini API.");
        }

        // 5. Parse JSON from Gemini response
        let aiAnalysis;
        try {
            const cleaned = rawText.replace(/```json|```/g, "").trim();
            aiAnalysis = JSON.parse(cleaned);
        } catch (e) {
            throw new Error("Failed to parse Gemini response as JSON: " + rawText);
        }

        // 6. Save analysis
        await pool.query(`
            UPDATE dataset_metadata
            SET metadata = metadata || jsonb_build_object('llm_analysis', $1::jsonb)
            WHERE dataset_id = $2
        `, [JSON.stringify(aiAnalysis), id]);

        // 7. Compute financial sums and persist to showroom_financials
        try {
            const finCols = aiAnalysis.financial_columns || {};
            const validColSet = new Set((metadata.columns || []).map(c => c.name));
            const revCols = (finCols.revenue || []).filter(c => validColSet.has(c));
            const expCols = (finCols.expenditure || []).filter(c => validColSet.has(c));
            const salCols = (finCols.salary || []).filter(c => validColSet.has(c));

            if (storageTable && showroomId && (revCols.length + expCols.length + salCols.length) > 0) {
                const sumCol = async (col) => {
                    try {
                        const r = await pool.query(
                            format(
                                `SELECT COALESCE(SUM(CASE WHEN regexp_replace(%I, '[^0-9.]', '', 'g') != '' THEN regexp_replace(%I, '[^0-9.]', '', 'g')::NUMERIC ELSE 0 END), 0) AS total FROM %I`,
                                col, col, storageTable
                            )
                        );
                        return Number(r.rows[0]?.total ?? 0);
                    } catch { return 0; }
                };

                let revenue = 0, expenditure = 0, salary_expense = 0;
                for (const col of revCols) revenue += await sumCol(col);
                for (const col of expCols) expenditure += await sumCol(col);
                for (const col of salCols) salary_expense += await sumCol(col);

                await pool.query(
                    `INSERT INTO showroom_financials
                       (showroom_id, dataset_id, dataset_type, dataset_type_label, revenue, expenditure, salary_expense)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (dataset_id) DO UPDATE
                     SET revenue = EXCLUDED.revenue,
                         expenditure = EXCLUDED.expenditure,
                         salary_expense = EXCLUDED.salary_expense,
                         dataset_type = EXCLUDED.dataset_type,
                         dataset_type_label = EXCLUDED.dataset_type_label`,
                    [showroomId, id, aiAnalysis.dataset_type || 'other',
                     aiAnalysis.dataset_type_label || '', revenue, expenditure, salary_expense]
                );
            }
        } catch (financialErr) {
            console.error("Financial processing failed (non-fatal):", financialErr.message);
        }

        return res.status(200).json({ success: true, analysis: aiAnalysis });

    } catch (err) {
        next(err);
    }
};
