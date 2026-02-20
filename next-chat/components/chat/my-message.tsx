import { WSChatEvent, WSReceiptSnapshot } from "@/types/ws-server-types.ts";
import UserIcon from "./user-icon.tsx";

type messageStatus = 'Sent' | 'Delivered' | 'Seen';

const MyMessage = ({ msg, currentUserId }: { msg: WSChatEvent, currentUserId: string }): React.ReactElement => {
  // Get receipts for everyone except me
  const otherReceipts: WSReceiptSnapshot[] = msg.receipts.filter(r => r.userId !== currentUserId);

  let msgStatus: messageStatus = 'Sent';

  if (otherReceipts.length > 0) {
    const allSeen: boolean = otherReceipts.every(r => r.seenAt !== null);
    const anyDelivered: boolean = otherReceipts.every(r => r.deliveredAt !== null);

    if (allSeen) {
      msgStatus = 'Seen'
    } else if (anyDelivered) {
      msgStatus = 'Delivered';
    }
    // console.log(msgStatus);
  }

  return (
    <>
      <div className="chat chat-end">
        <div className="chat-image avatar">
          <div className="w-10 relative">
            <UserIcon />
          </div>
        </div>
        <div className="chat-header">
          {msg.username}
          <time className="text-xs opacity-50">{msg.createdAt?.toLocaleString()}</time>
        </div>
        <div className="chat-bubble">{msg.content}</div>
        <div className="chat-footer opacity-50">{msgStatus}</div>
      </div>
    </>
  );
};

export default MyMessage;