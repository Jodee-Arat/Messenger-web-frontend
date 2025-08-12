import { Metadata } from "next";

import Chat from "@/components/features/chat/Chat";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Chat",
    description: "Chat page",
  };
};

const ChatIdPage = async (props: { params: Promise<{ chatId: string }> }) => {
  const params = await props.params;
  const chatId = params.chatId;

  return <Chat chatId={chatId} />;
};

export default ChatIdPage;
