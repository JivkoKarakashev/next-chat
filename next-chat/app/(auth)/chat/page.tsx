'use client';

import { useContext } from "react";
import { redirect } from "next/navigation";

import { AuthStateContext } from "@/context/auth.tsx";
import { queryParamsDefault } from "@/types/home-page-params";

const ChatPage = () => {
    const { isAuth } = useContext(AuthStateContext);
    if (!isAuth) {
        redirect(`/${queryParamsDefault}`);
    }

    return (
        <>
            <h1>Chat Page</h1>
        </>
    );
};

export default ChatPage;