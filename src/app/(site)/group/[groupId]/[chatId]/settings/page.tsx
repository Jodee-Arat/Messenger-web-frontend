import { Metadata } from "next";

import ChatSettings from "@/components/features/settings/chat/ChatSettings";
import RouteAccessGuard from "@/components/ui/elements/RouteAccessGuard";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Chat settings",
    description: "Chat settings page",
  };
};

const ChatSettingsPage = async (props: {
  params: Promise<{ groupId: string; chatId: string }>;
}) => {
  const params = await props.params;

  return (
    <RouteAccessGuard
      scope="chat"
      chatId={params.chatId}
      fallbackHref={
        params.groupId === "null" ? "/dm" : `/group/${params.groupId}`
      }
    >
      <ChatSettings />
    </RouteAccessGuard>
  );
};

export default ChatSettingsPage;
