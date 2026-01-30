'use client';

import { useContext, useRef } from "react";
import { redirect } from "next/navigation";

import { AuthStateContext } from "@/context/auth.tsx";
import { SocketStateContext } from "@/context/socket.tsx";
import { queryParamsDefault } from "@/types/home-page-params.ts";

import styles from './page.module.css';
import MyMessage from "@/components/chat/my-message.tsx";
import TheirMessage from "@/components/chat/their-message.tsx";
import { ChatType } from "@/types/ws-types.ts";

const ChatPage = () => {
    const { isAuth } = useContext(AuthStateContext);
    const { messages, send } = useContext(SocketStateContext);
    const txtAreaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    if (!isAuth) {
        redirect(`/${queryParamsDefault}`);
    }

    const sendMessage = (formData: FormData) => {
        // console.log(formData);
        const content = String(formData.get('content')).trim();
        if (!content) {
            return;
        }
        const message: ChatType = {
            type: 'chat',
            message: {
                id: crypto.randomUUID(),
                content
            }
        }
        // console.log(message);
        send(message);
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
                        {messages.length > 0 && (
                            messages.map((msg, i) => i % 2 === 0
                                ? <MyMessage key={msg.message.id} msg={msg} />
                                : <TheirMessage key={msg.message.id} msg={msg} />
                            )
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