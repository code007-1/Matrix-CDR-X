import { fileLogger } from './prod_logger.js';
import { GEMINI_API_URL } from '../statics.js';

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
    - callcategory VARCHAR(100), // call category
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
    - callcategory VARCHAR(100), // call category
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

async function callGemini(prompt) {
    if (!GEMINI_API_URL || GEMINI_API_URL === "") {
        throw new Error('GEMINI_API_URL is not defined');
    }
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status} ${response.statusText}): ${errorText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        fileLogger.error('Error calling Gemini:', error);
        throw error;
    }
}

export const AI = {
    generateSql: async (userQuery) => {
        const prompt = `${DB_SCHEMA}\n\nUser Question: "${userQuery}"\n\nGenerate the SQL query to answer this question. Remember, ONLY the SQL, nothing else.`;
        let sql = await callGemini(prompt);

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

        return await callGemini(prompt);
    }
};
