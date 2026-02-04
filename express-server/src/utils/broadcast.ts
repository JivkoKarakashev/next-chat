import { WebSocket as WSRuntime } from 'ws';

import { WS, ChatMessage, ChatType, HistoryType } from "../ws/types";
import { getSocketsByChannel } from "../ws/connectionStore";

// --- Broadcast helpers ---
const sendMessageByChannel = (channelId: string, message: ChatType): void => {
    const clients = getSocketsByChannel(channelId);
    const data = JSON.stringify(message);
    clients.forEach((client: WS) => {
        if (client.readyState === WSRuntime.OPEN) {
            client.send(data);
        }
    });
};

const sendChatHistoryToClient = (ws: WS, history: ChatMessage[]): void => {
    const historyMsg: HistoryType = {
        type: "history",
        messages: history
    };
    ws.send(JSON.stringify(historyMsg));
};

export {
    sendMessageByChannel,
    sendChatHistoryToClient
}