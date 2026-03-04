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
            SELECT d.name, dm.metadata
            FROM datasets d
            JOIN dataset_metadata dm ON d.id = dm.dataset_id
            WHERE d.id = $1 AND d.organization_id = $2
        `, [id, organizationId]);

        if (datasetQuery.rows.length === 0) {
            return res.status(404).json({ message: "Dataset not found or has no metadata." });
        }

        const { name, metadata } = datasetQuery.rows[0];

        // 2. Build the System Prompt enforcing strictly JSON output
        const systemPrompt = `You are an expert data analyst. You are given the metadata profile of a CSV dataset named "${name}". 
Your job is to recommend the best charts, dashboards, filters, and insights based ONLY on this metadata.

You MUST recommend EXACTLY 3 best charts that fit this specific data.
You MUST recommend EXACTLY 5 optimal filters that users would want to use to drill down into this data.

You MUST respond in pure JSON format perfectly matching the following schema. Do NOT include markdown code blocks, explanations, or any text outside of the JSON object:
{
  "charts": [
    {
      "chart_type": "bar|line|pie|scatter|kpi",
      "title": "String",
      "x_axis_column": "String",
      "y_axis_column": "String (optional)",
      "description": "Why is this chart useful?"
    }
  ],
  "filters": ["column_name1", "column_name2", "column_name3", "column_name4", "column_name5"],
  "insights": ["Insight 1", "Insight 2"]
}`;

        // 3. Post to the local Ollama Docker instance
        // Assuming default Ollama port on localhost. Adjust if needed via env vars.
        const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3", // Adjust if using a specific model tag like llama3:8b
                prompt: `Here is the dataset metadata:\n\n${JSON.stringify(metadata, null, 2)}`,
                system: systemPrompt,
                stream: false,
                format: "json" // Forces Ollama to ensure the output parses as JSON
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API returned status: ${response.status}`);
        }

        const ollamaData = await response.json();

        // 4. Parse JSON out of Ollama's response
        let aiAnalysis;
        try {
            aiAnalysis = JSON.parse(ollamaData.response);
        } catch (e) {
            throw new Error("Failed to parse Ollama response as JSON: " + ollamaData.response);
        }

        // 5. Save the analysis back into dataset_metadata for future immediate retrieval
        // We do a JSONB merge to keep the existing metadata and inject the new analysis
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
