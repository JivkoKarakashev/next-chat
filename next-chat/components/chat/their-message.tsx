import { WSChatEvent } from "@/types/ws-server-types.ts";
import UserIcon from "./user-icon.tsx";

const TheirMessage = ({ msg }: { msg: WSChatEvent }): React.ReactElement => {

  return (
    <>
      <div className="chat chat-start">
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
      </div>
    </>
  );
};

export default TheirMessage;