
import { fileLogger } from './prod_logger.js';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL_NAME = 'gemma3:4b'; // Or 'mistral', make configurable if needed

// Schema definition for the LLM
const DB_SCHEMA = `
You have access to a PostgreSQL database with the following tables:

1. internal
    - sno SERIAL PRIMARY KEY, // auto increment
    - source VARCHAR(100), // caller number
    - soruceipport INTEGER, // caller port
    - destination VARCHAR(100), // callee number
    - destinationipport INTEGER, // callee port
    - connectednumber VARCHAR(100), // connected number
    - connectedipport INTEGER, // connected port
    - date DATE,  // date
    - time TIME, // time
    - answerduration INTEGER, // answer duration in seconds
    - calltype VARCHAR(100), // call type
    - device_ip VARCHAR(45) // device ip

2. incoming
    - sno SERIAL PRIMARY KEY, // auto increment
    - source VARCHAR(100), // caller number
    - soruceipport INTEGER, // caller port
    - trunk VARCHAR(100), // trunk name
    - destination VARCHAR(100), // callee number
    - destinationipport INTEGER, // callee port
    - connectednumber VARCHAR(100), // connected number
    - connectedipport INTEGER, // connected port
    - date DATE,  // date
    - time TIME, // time
    - answerduration INTEGER, // answer duration in seconds
    - holdduration INTEGER, // hold duration in seconds
    - speechduration INTEGER, // speech duration in seconds
    - calltype VARCHAR(100), // call type
    - device_ip VARCHAR(45) // device ip

3. outgoing
    - sno SERIAL PRIMARY KEY, // auto increment
    - source VARCHAR(100), // caller number
    - soruceipport INTEGER, // caller port
    - trunk VARCHAR(100), // trunk name
    - destination VARCHAR(100), // callee number
    - destinationipport INTEGER, // callee port
    - connectednumber VARCHAR(100), // connected number
    - connectedipport INTEGER, // connected port
    - date DATE,  // date
    - time TIME, // time
    - answerduration INTEGER, // answer duration in seconds
    - calltype VARCHAR(100), // call type
    - device_ip VARCHAR(45) // device ip

4. devices
    - id (SERIAL PRIMARY KEY) // auto increment
    - name (VARCHAR) // Device name
    - ip (VARCHAR) // Device IP
    - incoming_port (INT) // incoming port
    - outgoing_port (INT) // outgoing port
    - intercalls_port (INT) // intercalls port

RULES:
- Return ONLY the SQL query. No markdown, no explanation.
- Use valid PostgreSQL syntax.
- Ensure to select all columns (*) unless specific columns are asked for.
- For search, use ILIKE for text fields.
- If the user asks for "last calls", order by 'date' DESC, 'time' DESC and use LIMIT.
- Default LIMIT to 20 if not specified.
- Use 'table_name' in identifiers.
`;

async function callOllama(prompt) {
    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        fileLogger.error('Error calling Ollama:', error);
        throw error;
    }
}

export const AI = {
    generateSql: async (userQuery) => {
        const prompt = `${DB_SCHEMA}\n\nUser Question: "${userQuery}"\n\nGenerate the SQL query to answer this question. Remember, ONLY the SQL, nothing else.`;
        let sql = await callOllama(prompt);

        // Basic cleanup if the model chats a bit (though we asked it not to)
        sql = sql.replace(/```sql|```/g, '').replace(/\s+/g, ' ').trim();
        return sql;
    },

    summarizeResults: async (userQuery, sql, results) => {
        const dataStr = JSON.stringify(results);
        // Truncate data if too large to avoid context limits
        const truncatedData = dataStr.length > 6000 ? dataStr.substring(0, 6000) + '... (truncated)' : dataStr;

        const prompt = `
        User Question: "${userQuery}"
        Executed SQL: "${sql}"
        Database Results: ${truncatedData}

        Please provide a concise, natural language summary of these results for the user. 
        If there are no results, say so politely.
        Do not mention the SQL or technical details unless asked.
        `;

        return await callOllama(prompt);
    }
};
