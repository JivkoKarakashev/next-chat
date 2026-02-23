"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("./env.js");
const config = {
    env: env_js_1.env.NODE_ENV,
    port: env_js_1.env.LISTENING_PORT
};
exports.default = config;
