'use client';

import { useContext } from "react";

import { SocketStateContext } from "@/context/socket.tsx";
import { Channel } from "@/types/channel.ts";

const ChannelsTabs = ({ channel }: { channel: Channel }): React.ReactElement => {
  const { activeChannel, joinChannel } = useContext(SocketStateContext);

  return (
    <>
      <a
        role="tab"
        className={`tab ${channel.channelName === activeChannel ? 'tab-active text-primary [--tab-bg:orange] [--tab-border-color:red]' : ''}`}
        onClick={() => joinChannel(channel.channelName)}
      >{`#${channel.channelName}`}
      </a>
    </>
  );
};

export default ChannelsTabs;