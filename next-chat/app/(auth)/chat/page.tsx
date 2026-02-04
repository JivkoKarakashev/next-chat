'use client';

import { useContext, useEffect, useRef } from "react";
import { redirect } from "next/navigation";

import styles from './page.module.css';

import { AuthStateContext } from "@/context/auth.tsx";
import { SocketStateContext } from "@/context/socket.tsx";
import MyMessage from "@/components/chat/my-message.tsx";
import TheirMessage from "@/components/chat/their-message.tsx";
import { ChatType, JoinType } from "@/types/ws-types.ts";
import { queryParamsDefault } from "@/types/query-params.ts";

const ChatPage = (): React.ReactElement => {
  const { isAuth, uId } = useContext(AuthStateContext);
  const { connected, isReady, messages, send } = useContext(SocketStateContext);
  const txtAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isAuth) {
    redirect(`/${queryParamsDefault}`);
  }

  useEffect(() => {
    if (connected && isReady) {
      const msg: JoinType = {
        type: 'join',
        channelName: 'general',
      };
      console.log("➡️ SENDING JOIN", msg);
      send(msg);
    }
  }, [connected, isReady, send]);

  const sendMessage = (formData: FormData) => {
    // console.log(formData);
    const content = String(formData.get('content')).trim();
    if (!content) {
      console.log(content);
      return;
    }
    const msg: ChatType = {
      type: 'chat',
      message: {
        userId: uId,
        content
      }
    }
    // console.log(msg);
    send(msg);
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
    <>
      <main className={styles.main}>
        <section className={styles.title}>
          <h1>Chat Page</h1>
        </section>

        <h3>Message List</h3>

        <section className={styles.messages}>
          <article className={styles['message-list']}>
            {messages.length > 0 ? (
              messages.map((msg) => msg.userId === uId
                ? <MyMessage key={msg.id} msg={msg} />
                : <TheirMessage key={msg.id} msg={msg} />
              )
            ) : (
              <p>No messages yet...</p>
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
          <button className={styles["send-msg-btn"]} type="submit">Send</button>
        </form>
      </main>
    </>
  );
};

export default ChatPage;