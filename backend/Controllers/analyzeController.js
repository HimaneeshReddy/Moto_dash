import pool from "../config/db.js";

export const analyzeDataset = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;

    try {
        // 1. Fetch the dataset metadata
        const datasetQuery = await pool.query(`
            SELECT d.name, dm.metadata
            FROM datasets d
            JOIN dataset_metadata dm ON d.id = dm.dataset_id
            WHERE d.id = $1 AND d.organization_id = $2
        `, [id, organizationId]);

        if (datasetQuery.rows.length === 0) {
            return res.status(404).json({ message: "Dataset not found or has no metadata." });
        }

        const { name, metadata } = datasetQuery.rows[0];

        // 2. Compact column summary (~50-100 tokens for all columns)
        const columnSummary = (metadata.columns || []).map(col => {
            if (col.type === 'numeric') return `${col.name} (number, min=${col.min}, max=${col.max})`;
            if (col.type === 'date') return `${col.name} (date)`;
            const topVals = (col.unique_values || []).slice(0, 5).join(', ');
            return `${col.name} (text, e.g. ${topVals})`;
        }).join('\n');

        // 3. Sharp, precise prompt
        const systemPrompt = `You are a data analyst. Given a dataset column list, output EXACTLY 3 charts and EXACTLY 5 insights as pure JSON.

RULES:
- chart_type must be one of: bar, line, area, pie, scatter, radar, composed, radialBar, treemap
- x_axis_column and y_axis_column must be exact column names from the dataset
- filters must be 3 exact column names most useful for filtering
- Each insight must state a specific, concrete fact (e.g. "Sales peak in Q4", "Average price is 450")
- Output pure JSON only, no markdown, no extra text

{
  "charts": [
    {"chart_type": "bar", "title": "...", "x_axis_column": "...", "y_axis_column": "...", "description": "..."}
  ],
  "filters": ["col1", "col2", "col3"],
  "insights": [
    {"type": "Insight", "description": "A specific fact about this data."}
  ]
}`;

        const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
        const prompt = `Dataset: "${name}" | Rows: ${metadata.row_count ?? 'unknown'}\n\nColumns:\n${columnSummary}\n\nGenerate 3 charts and 5 insights.`;

        let response;
        try {
            response = await fetch(`${OLLAMA_URL}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: process.env.OLLAMA_MODEL || "llama3",
                    prompt,
                    system: systemPrompt,
                    stream: false,
                    format: "json",
                    keep_alive: "15m",
                    options: {
                        num_ctx: 4096,
                        num_predict: 800,
                        temperature: 0.1
                    }
                })
            });
        } catch (fetchErr) {
            throw new Error(`Failed to connect to Ollama at ${OLLAMA_URL}: ${fetchErr.message}`);
        }

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ollama API returned status ${response.status}: ${errText}`);
        }

        const ollamaData = await response.json();

        // 4. Parse JSON from Ollama response
        let aiAnalysis;
        try {
            aiAnalysis = JSON.parse(ollamaData.response);
        } catch (e) {
            throw new Error("Failed to parse Ollama response as JSON: " + ollamaData.response);
        }

        // 5. Save analysis
        await pool.query(`
            UPDATE dataset_metadata
            SET metadata = metadata || jsonb_build_object('llm_analysis', $1::jsonb)
            WHERE dataset_id = $2
        `, [JSON.stringify(aiAnalysis), id]);

        return res.status(200).json({ success: true, analysis: aiAnalysis });

    } catch (err) {
        if (err.cause?.code === 'ECONNREFUSED' && err.message.includes('11434')) {
            return res.status(503).json({
                message: "Ollama is not running or accessible. Please ensure your Ollama container is running on port 11434."
            });
        }
        next(err);
    }
};