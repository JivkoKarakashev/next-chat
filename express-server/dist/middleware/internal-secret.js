"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireXInternalSecret = void 0;
const env_js_1 = require("../env.js");
const requireXInternalSecret = (req, res, next) => {
    const headerValue = req.get('x-internal-secret');
    if (headerValue === env_js_1.env.X_INTERNAL_SECRET) {
        next();
    }
    else {
        res.status(401).json({ error: 'Unauthorized!' });
    }
};
exports.requireXInternalSecret = requireXInternalSecret;
