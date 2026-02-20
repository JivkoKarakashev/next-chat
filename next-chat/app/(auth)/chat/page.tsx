'use client';

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { redirect } from "next/navigation";

import styles from './page.module.css';

import { AuthStateContext } from "@/context/auth.tsx";
import { SocketStateContext } from "@/context/socket.tsx";
import MyMessage from "@/components/chat/my-message.tsx";
import TheirMessage from "@/components/chat/their-message.tsx";
import { queryParamsDefault } from "@/types/query-params.ts";
import Presence from "@/components/chat/presence.tsx";
import ChannelsTabs from "@/components/chat/channels-tabs.tsx";
import CreateChannelModal from "@/components/chat/create-channel-modal.tsx";
import UserPanel from "@/components/chat/user-panel.tsx";
import { DBUserRow } from "@/types/ws-server-types.ts";

const ChatPage = (): React.ReactElement => {
  const { isAuth, uId } = useContext(AuthStateContext);
  const [allUsers, setAllUsers] = useState<DBUserRow[]>([]);
  const { connected, onlineUsers } = useContext(SocketStateContext);
  const { channels, usersActiveChannel, activeChannelId, memoizedMessagesByChannel, joinChannel, sendChat } = useContext(SocketStateContext);
  const txtAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastSeenRef = useRef<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  if (!isAuth || !uId) {
    redirect(`/${queryParamsDefault}`);
  }

  useEffect(() => {
    fetch('/api/users')
      .then(res => {
        if (!res.ok) {
          throw new Error('Faied to fetch all users!');
        }
        return (res.json()) as unknown as DBUserRow[];
      })
      .then(setAllUsers)
      .catch(console.error);
  }, []);

  useEffect(() => {
    lastSeenRef.current = null;
  }, [activeChannelId]);

  const channelMap = useMemo(() => {
    const map: Record<string, string> = {};

    channels.forEach(({ channelId, channelName }) => {
      map[channelId] = channelName;
    });

    return map;
  }, [channels]);


  const switchModal = () => setShowModal(!showModal);

  const sendMessage = (formData: FormData) => {
    // console.log(formData);
    const content = String(formData.get('content')).trim();
    // console.log(content);
    if (!content) {
      throw new Error('Empty message!');
    }
    if (!uId) {
      throw new Error('uid is missing');
    }
    if (!activeChannelId) {
      throw new Error('ActiveChannel is null!');
    }

    sendChat(content);
    formRef.current?.reset();
  };

  const resize = (): void => {
    const el = txtAreaRef.current;
    if (!el) { return };
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const resetSize = () => {
    const el = txtAreaRef.current;
    if (!el) { return };
    el.style.height = 'auto';
  };

  return (
    <div className={styles['page-wrapper']}>
      <main className={`${styles.main} ${styles.col} ${styles.main}`}>
        <section className={styles.title}>
          <h1>Chat Page</h1>
        </section>

        <div role="tablist" className="tabs tabs-lift">
          <a onClick={switchModal} role="tab" className="tab">
            <svg className={styles.subtract} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="style=fill">
                <g id="add">
                  <path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M1.25 7.25C1.25 3.93629 3.93629 1.25 7.25 1.25L16.75 1.25C20.0637 1.25 22.75 3.93629 22.75 7.25L22.75 16.75C22.75 20.0637 20.0637 22.75 16.75 22.75L7.25 22.75C3.93629 22.75 1.25 20.0637 1.25 16.75L1.25 7.25ZM12.0248 6.32352C12.3578 6.32352 12.6277 6.59348 12.6277 6.92649L12.6277 11.3687L17.2132 11.3687C17.5641 11.3687 17.8486 11.6532 17.8486 12.0041C17.8486 12.3551 17.5641 12.6395 17.2132 12.6395L12.6277 12.6395L12.6277 16.8281C12.6277 17.1611 12.3577 17.4311 12.0247 17.4311C11.6917 17.4311 11.4217 17.1611 11.4217 16.8281L11.4218 12.6395L6.77862 12.6395C6.42768 12.6395 6.1432 12.355 6.1432 12.0041C6.1432 11.6531 6.42769 11.3687 6.77862 11.3687L11.4218 11.3687L11.4218 6.92648C11.4218 6.59347 11.6917 6.32352 12.0248 6.32352Z" fill="currentColor" />
                </g>
              </g>
            </svg>
          </a>
          {channels.map(ch => {
            return (
              <ChannelsTabs
                key={ch.channelId}
                channel={ch}
              />
            );
          })}
        </div>

        <h3>Message List</h3>

        <section className={styles.messages}>
          <article className={styles['message-list']}>
            {activeChannelId ? (memoizedMessagesByChannel.length > 0 ? (
              memoizedMessagesByChannel.map((msg, idx) => {
                switch (msg.type) {
                  case 'chat': {
                    return msg.userId === uId
                      ? <MyMessage key={msg.id} msg={msg} currentUserId={uId} />
                      : <TheirMessage key={msg.id} msg={msg} />;
                  }
                  case 'presence': {
                    return (
                      <Presence key={`presence-${idx}-${msg.channelId}`}
                        event={msg.event}
                        username={msg.username}
                      />
                    );
                  }
                  case 'system': {
                    return (
                      <div key={`system-${idx}`} className="text-center text-sm opacity-60">
                        {msg.content}
                      </div>
                    );
                  }
                }
              })
            ) : (
              <p>No messages yet...</p>
            )) : (
              <p>Select a channel from above to join.</p>
            )}
          </article>
        </section>

        <form
          ref={formRef}
          id="msg-form"
          className={styles['msg-form']}
          action={sendMessage}
          onReset={resetSize}
        >
          <label htmlFor="content" />
          <textarea
            ref={txtAreaRef}
            rows={5}
            name="content"
            id="content"
            className={styles['msg-content']}
            placeholder="--Enter your message HERE--"
            onInput={resize}
          />
          <button className={`${styles["send-msg-btn"]} ${!activeChannelId ? styles.disabled : ''}`} type="submit" disabled={!activeChannelId}>Send</button>
        </form>
        {showModal === true && (
          <CreateChannelModal
            onClose={switchModal}
            onSubmit={(name: string) => joinChannel(name)}
          />
        )}

      </main >
      <aside className={`flex flex-col h-[80vh] w-80 bg-[#131212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl ${styles.col} ${styles.aside}`}>
        <UserPanel
          connected={connected}
          allUsers={allUsers}
          onlineUsers={onlineUsers}
          channelMap={channelMap}
          usersActiveChannel={usersActiveChannel}
        />
      </aside>
    </div>
  );
};

export default ChatPage;