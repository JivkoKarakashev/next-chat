"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersHandler = void 0;
const users_1 = require("../api/users");
const usersHandler = async (_, res) => {
    const users = await (0, users_1.getAllUsers)();
    // console.log(users);
    return res.status(200).json(users);
};
exports.usersHandler = usersHandler;
