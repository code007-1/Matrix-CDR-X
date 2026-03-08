import dotenv from 'dotenv';
dotenv.config();

//export const ports = [5665, 5666, 5667];//internal, incoming, outgoing

export const internal_cdr_table_name = process.env.INTERNAL_CDR_TABLE_NAME || "internal";
export const incoming_cdr_table_name = process.env.INCOMING_CDR_TABLE_NAME || "incoming";
export const outgoing_cdr_table_name = process.env.OUTGOING_CDR_TABLE_NAME || "outgoing";

export const DB_USER = process.env.DB_USER || 'postgres';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_NAME = process.env.DB_NAME || 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_PORT = process.env.DB_PORT || 5432;

export const GEMINI_API_URL = process.env.GEMINI_API_URL || ``;

export const jwt_access_key = process.env.JWT_ACCESS_KEY || "891723987281973";
export const jwt_refresh_key = process.env.JWT_REFRESH_KEY || "89798ghg687ghjg";
export const port = process.env.PORT || 5000;