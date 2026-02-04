import Image from "next/image";

import { ChatMessage } from "@/types/ws-types.ts";

const MyMessage = ({ msg }: { msg: ChatMessage }): React.ReactElement => {

  return (
    <>
      <div className="chat chat-end">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full relative">
            <Image
              alt="Tailwind CSS chat bubble component"
              src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
              fill
              sizes='(max-width: 768px) 99vw, (max-width: 1200px) 50vw, 33vw'
            />
          </div>
        </div>
        <div className="chat-header">
          {/* Obi-Wan Kenobi */}
          {msg.email}
          {/* <time className="text-xs opacity-50">12:46</time> */}
          <time className="text-xs opacity-50">{msg.createdAt?.toLocaleString()}</time>
        </div>
        <div className="chat-bubble">{msg.content}</div>
        <div className="chat-footer opacity-50">Delivered</div>
      </div>
    </>
  );
};

export default MyMessage;