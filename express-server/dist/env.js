"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), envFile)
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
    X_INTERNAL_SECRET: process.env.X_INTERNAL_SECRET,
    HEARTBEAT_INTERVAL: parseInt(process.env.HEARTBEAT_INTERVAL || '30000')
};
exports.env = env;
