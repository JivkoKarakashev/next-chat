"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCreatedHandler = void 0;
const broadcast_1 = require("../utils/broadcast");
const userCreatedHandler = (req, res) => {
    const { id, username } = req.body;
    if (!id || !username) {
        return res.status(400).json({ error: 'Invalid payload' });
    }
    const event = {
        type: 'user_created',
        user: {
            id,
            username
        }
    };
    (0, broadcast_1.broadcastAll)(event);
    return res.sendStatus(204);
};
exports.userCreatedHandler = userCreatedHandler;
