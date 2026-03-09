import pool from "../config/db.js";

/**
 * Trigger an Ollama analysis on a dataset by passing its pre-computed metadata.
 */
export const analyzeDataset = async (req, res, next) => {
    const { id } = req.params;
    const { organizationId } = req.user;

    try {
        // 1. Fetch the dataset's metadata from the DB. Use organizationId to ensure security.
        const datasetQuery = await pool.query(`
            SELECT d.name, d.storage_table_name, dm.metadata
            FROM datasets d
            JOIN dataset_metadata dm ON d.id = dm.dataset_id
            WHERE d.id = $1 AND d.organization_id = $2
        `, [id, organizationId]);

        if (datasetQuery.rows.length === 0) {
            return res.status(404).json({ message: "Dataset not found or has no metadata." });
        }

        const { name, storage_table_name, metadata } = datasetQuery.rows[0];

        // Fetch real column names from the storage table to provide exact schema to LLM
        const columnsResult = await pool.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = $1 AND column_name != '_id'
             ORDER BY ordinal_position`,
            [storage_table_name]
        );
        const realColumns = columnsResult.rows.map(r => r.column_name);
        console.log(`[Analyze] Dataset: "${name}" | Table: "${storage_table_name}" | Columns: [${realColumns.join(', ')}]`);

        // 2. Build the System Prompt enforcing strictly JSON output
        // Build a clear typed column schema from the stored metadata
        const columnMeta = (metadata.columns || []).map(col => {
            let typeHint = `TEXT (store as text, use CAST(${col.name} AS NUMERIC) for math)`;
            if (col.type === 'numeric') {
                typeHint = `NUMERIC (stored as TEXT, use CAST(${col.name} AS NUMERIC)). min=${col.min}, max=${col.max}, avg=${col.avg}`;
            } else if (col.type === 'date') {
                typeHint = `DATE (stored as TEXT, use CAST(${col.name} AS DATE) for date ops)`;
            } else if (col.type === 'text') {
                const topVals = (col.unique_values || []).slice(0, 8).map(v => `'${v}'`).join(', ');
                typeHint = `TEXT. ${col.unique_count} unique values. Top values: ${topVals}`;
            }
            return `  - "${col.name}" [${typeHint}]`;
        }).join('\n');

        const systemPrompt = `You are an expert data analyst. You are given the metadata profile of a CSV dataset named "${name}".

DATASET SCHEMA (PostgreSQL table: "${storage_table_name}"):
${columnMeta}

CRITICAL SQL RULES:
- Use ONLY the exact column names listed above.
- ALL columns are stored as PostgreSQL TEXT type — always CAST when doing numeric or date operations.
- Use the literal table name "${storage_table_name}" in every SQL query.
You MUST recommend EXACTLY 3 charts and EXACTLY 5 insights.

SUPPORTED CHART TYPES:
- "bar" — comparing categorical values
- "line" — trends over time or continuous data
- "area" — volume/magnitude over time
- "pie" — part-to-whole (≤8 categories)
- "scatter" — correlation between two numeric columns
- "radar" — comparing multiple metrics across categories
- "composed" — bar + line combination
- "radialBar" — progress/percentage comparison across categories
- "treemap" — proportional size of hierarchical or categorical data

You MUST respond in PURE JSON matching this exact schema — no markdown, no text outside JSON:
{
  "charts": [
    {
      "chart_type": "bar|line|area|pie|scatter|radar|composed|radialBar|treemap",
      "title": "Descriptive chart title",
      "x_axis_column": "exact_column_name",
      "y_axis_column": "exact_column_name (omit for pie/treemap)",
      "description": "Why this chart reveals the most about this data"
    }
  ],
  "filters": ["col1", "col2", "col3"],
  "insights": [
    {
      "type": "Insight",
      "description": "A natural, specific sentence that uses {{placeholder}} names. CRITICAL: Every single {{placeholder}} MUST exactly match the AS alias_name used in the SELECT query. Use real entity names (people, products, categories) from the data. Examples:\\n- '{{name}} generated the highest sales with {{count}} bikes sold, accounting for {{pct}} of total transactions.'\\n- 'The highest priced item was {{model}} sold by {{name}} for Rs. {{max_price}}.'\\n- 'The average selling price across all records is Rs. {{avg_price}}, with a total revenue of Rs. {{total_revenue}}.'\\n- '{{model}} is the most frequently sold item with {{count}} units, making it the top performer.'\\n- 'The lowest recorded sale was Rs. {{min_price}}, while the highest was Rs. {{max_price}}, showing a spread of Rs. {{spread}}.'\\nEach MUST be a grammatically complete sentence.",
      "sql_query": "Use COUNT, SUM, AVG, MIN, or MAX. MUST SELECT columns with explicit AS alias_name that exactly match the {{placeholders}}. Set LIMIT 1. Example: SELECT salesperson AS name, COUNT(*) AS count, ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM \"${storage_table_name}\"), 1) || '%' AS pct FROM \"${storage_table_name}\" GROUP BY salesperson ORDER BY count DESC LIMIT 1"
    },
    {
      "type": "Insight",
      "description": "Another specific fact using {{placeholders}}. Use a different aggregate (SUM, MAX, MIN, AVG) and different columns than above.",
      "sql_query": "Different aggregate query using the actual column names."
    },
    {
      "type": "Insight",
      "description": "Another specific fact using {{placeholders}}. Focus on AVG or totals.",
      "sql_query": "Aggregate query using AVG, SUM or ROUND."
    },
    {
      "type": "Insight",
      "description": "Another specific fact using {{placeholders}}. Focus on MIN/MAX or extremes.",
      "sql_query": "Aggregate query using MIN or MAX."
    },
    {
      "type": "Insight",
      "description": "Another specific fact using {{placeholders}}. A count or distribution insight.",
      "sql_query": "Aggregate query using COUNT with GROUP BY."
    }
  ]
}`;

        // 3. Post to the local Ollama Docker instance
        const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL || "llama3",
                prompt: `Here is the dataset metadata:\n\n${JSON.stringify(metadata, null, 2)}`,
                system: systemPrompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ollama API returned status ${response.status}: ${errText}`);
        }

        const ollamaData = await response.json();

        // 4. Parse JSON out of Ollama's response
        let aiAnalysis;
        try {
            aiAnalysis = JSON.parse(ollamaData.response);
        } catch (e) {
            throw new Error("Failed to parse Ollama response as JSON: " + ollamaData.response);
        }

        // 5. For each insight, run the SQL against the real table and embed the result
        //    into the description so it contains actual computed statistics.
        const BLOCKLIST = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'CREATE'];

        const enrichedInsights = await Promise.all(
            (aiAnalysis.insights || []).map(async (insight) => {
                if (!insight.sql_query || typeof insight.sql_query !== 'string') return insight;

                const upperSql = insight.sql_query.trim().toUpperCase();
                const isBlocked = BLOCKLIST.some(kw => upperSql.includes(kw));
                if (isBlocked || !upperSql.startsWith('SELECT')) return insight;

                try {
                    let safeSql = insight.sql_query;

                    // 1. Replace MySQL-style backticks
                    safeSql = safeSql.replace(/`/g, '"');

                    // 2. Replace {{table_name}} placeholder if the LLM still used it
                    safeSql = safeSql.replace(/["']?\{\{table_name\}\}["']?/gi, `"${storage_table_name}"`);

                    // 3. Fix occurrences of the real table name, absorbing any existing quotes to avoid ""double boxing""
                    safeSql = safeSql.replace(new RegExp(`["']?\\b${storage_table_name}\\b["']?`, 'g'), `"${storage_table_name}"`);

                    // 4. Strip and cap LIMIT
                    safeSql = safeSql.replace(/\bLIMIT\s+\d+\b/gi, '').trim().replace(/;$/, '') + ' LIMIT 5';

                    console.log(`[Insight SQL] Running: ${safeSql}`);
                    const result = await pool.query(safeSql);
                    console.log(`[Insight SQL] Success, rows: ${result.rows.length}, data:`, JSON.stringify(result.rows[0]));

                    if (result.rows.length > 0) {
                        const firstRow = result.rows[0];

                        // Substitute every {{key}} in the description with the matching column
                        // value from the SQL result row — enabling natural narrative sentences
                        // like: '{{model}} accounts for {{pct}} of sales'
                        let enrichedDescription = insight.description;
                        for (const [key, val] of Object.entries(firstRow)) {
                            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
                            // Round numeric floats to 2 decimal places; leave strings/ints as-is
                            let displayVal = val ?? '';
                            const num = parseFloat(displayVal);
                            if (!isNaN(num) && !Number.isInteger(num) && String(displayVal).includes('.')) {
                                displayVal = num.toFixed(2);
                            }
                            enrichedDescription = enrichedDescription.replace(placeholder, String(displayVal));
                        }

                        // Legacy fallback: if unreplaced placeholders remain
                        // (LLM used wrong alias), strip them gracefully
                        enrichedDescription = enrichedDescription.replace(/\{\{[^}]+\}\}/gi, '[...]');

                        return {
                            ...insight,
                            description: enrichedDescription,
                            computed_result: firstRow,
                        };
                    }
                } catch (sqlErr) {
                    console.warn(`Insight SQL failed: ${sqlErr.message}`);
                    // Fallback so the user doesn't see broken {{placeholder}} text
                    return {
                        ...insight,
                        description: insight.description.replace(/\{\{[^}]+\}\}/gi, '[...]'),
                    };
                }

                // If query ran but 0 rows, fix {{result}} or general placeholders anyway
                return {
                    ...insight,
                    description: insight.description.replace(/\{\{[^}]+\}\}/gi, '[...]'),
                };
            })
        );

        aiAnalysis.insights = enrichedInsights;

        // 6. Save the enriched analysis
        await pool.query(`
            UPDATE dataset_metadata
            SET metadata = metadata || jsonb_build_object('llm_analysis', $1::jsonb)
            WHERE dataset_id = $2
        `, [JSON.stringify(aiAnalysis), id]);

        return res.status(200).json({
            success: true,
            analysis: aiAnalysis
        });

    } catch (err) {
        if (err.cause?.code === 'ECONNREFUSED' && err.message.includes('11434')) {
            return res.status(503).json({
                message: "Ollama is not running or accessible. Please ensure your Ollama container is running on port 11434."
            });
        }
        next(err);
    }
};
