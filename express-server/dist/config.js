"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./env");
const config = {
    env: env_1.env.NODE_ENV,
    port: env_1.env.LISTENING_PORT
};
exports.default = config;
