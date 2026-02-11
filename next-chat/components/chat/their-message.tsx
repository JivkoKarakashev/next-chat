import { ChatType } from "@/types/ws-types.ts";
import UserIcon from "./user-icon";

const TheirMessage = ({ msg }: { msg: ChatType }): React.ReactElement => {

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
        <div className="chat-footer opacity-50">Seen at 12:46</div>
      </div>
    </>
  );
};

export default TheirMessage;