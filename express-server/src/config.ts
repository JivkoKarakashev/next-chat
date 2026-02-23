import { env } from "./env.js";


const config = {
    env: env.NODE_ENV,
    port: env.LISTENING_PORT
}

export default config;