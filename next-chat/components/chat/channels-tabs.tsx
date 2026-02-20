'use client';

import { useContext } from "react";

import { SocketStateContext } from "@/context/socket.tsx";
import { Channel } from "@/types/channel.ts";

const ChannelsTabs = ({ channel }: { channel: Channel }): React.ReactElement => {
  const { unreadByChannel, activeChannelId, joinChannel } = useContext(SocketStateContext);

  return (
    <>
      <a
        role="tab"
        className={`tab ${channel.channelId === activeChannelId ? 'tab-active text-primary [--tab-bg:orange] [--tab-border-color:red]' : ''}`}
        onClick={() => joinChannel(channel.channelName)}
      >{`#${channel.channelName}`}
      </a>
      {unreadByChannel[channel.channelId] > 0 && (
        <span className='badge badge-error'>
          {unreadByChannel[channel.channelId]}
        </span>
      )}
    </>
  );
};

export default ChannelsTabs;