
import express from 'express';
import { AI } from '../modules/ai.js';
import { fileLogger } from '../modules/prod_logger.js';
import { DB } from '../modules/db.js';
// We need access to the pool to execute raw SQL. 
// Since db.js exports a DB object, we might need to expose the pool or add a raw query method to DB.
// Let's inspect db.js again or add a method to it. 
// Wait, I can't easily export 'pool' from db.js because it is not exported. 
// I should add a generic 'executeQuery' method to `DB` in `db.js`.
// But for now, let's assume I will add `DB.runRawSql(sql)` to db.js.

const router = express.Router();

router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // 1. Generate SQL
        const sql = await AI.generateSql(message);
        fileLogger.info(`AI Generated SQL: ${sql}`);

        // 2. Execute SQL
        let results;
        try {
            results = await DB.runCustomQuery(sql);
        } catch (dbError) {
            fileLogger.error('SQL Execution Error:', dbError);
            // If SQL fails, we might want to tell the AI to try again or just return the error.
            return res.json({
                answer: "I'm sorry, I couldn't understand the database structure enough to answer that properly. (SQL Error)",
                sql: sql,
                error: dbError.message
            });
        }

        // 3. Summarize Results
        const answer = await AI.summarizeResults(message, sql, results);

        res.json({ answer, sql, results });

    } catch (error) {
        fileLogger.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
