import { Message } from "@/context/socket.tsx";
import Image from "next/image";

const TheirMessage = ({ message }: { message: Message }): React.ReactElement => {

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
                    Anakin
                    <time className="text-xs opacity-50">12:46</time>
                </div>
                <div className="chat-bubble">{message.content}</div>
                <div className="chat-footer opacity-50">Seen at 12:46</div>
            </div>
        </>
    );
};

export default TheirMessage;