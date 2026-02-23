"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.channelsHandler = void 0;
const chat_js_1 = require("./chat.js");
const channelsHandler = async (_, res) => {
    const allChannels = await (0, chat_js_1.getAllChannels)();
    // console.log(allChannels);
    return res.status(200).json(allChannels);
};
exports.channelsHandler = channelsHandler;
