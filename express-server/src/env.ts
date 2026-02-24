import path from "path";
import dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;

dotenv.config({
    path: path.resolve(process.cwd(), envFile)
  });

if (!process.env.POSTGRES_URL) {
    throw new Error(`POSTGRES_URL is missing in ${envFile}!`);
}

console.log('Using DB host:', new URL(process.env.POSTGRES_URL).hostname);
console.log("DB URL OK:", !!process.env.POSTGRES_URL);

const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    LISTENING_PORT: parseInt(process.env.LISTENING_PORT || '3030'),
    POSTGRES_URL: process.env.POSTGRES_URL,
    X_INTERNAL_SECRET: process.env.X_INTERNAL_SECRET
};

export {
    env
}