import { Metadata } from "next";

import Chat from "@/components/features/chat/Chat";
import RouteAccessGuard from "@/components/ui/elements/RouteAccessGuard";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Chat",
    description: "Chat page",
  };
};

const ChatIdPage = async (props: {
  params: Promise<{ groupId: string; chatId: string }>;
}) => {
  const params = await props.params;
  const groupId = params.groupId;
  const chatId = params.chatId;

  return (
    <RouteAccessGuard
      scope="chat"
      chatId={chatId}
      fallbackHref={groupId === "null" ? "/dm" : `/group/${groupId}`}
    >
      <Chat chatId={chatId} />
    </RouteAccessGuard>
  );
};

export default ChatIdPage;
