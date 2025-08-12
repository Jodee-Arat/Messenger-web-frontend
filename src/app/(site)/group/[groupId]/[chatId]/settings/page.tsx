import { Metadata } from "next";

import ChatSettings from "@/components/features/settings/chat/ChatSettings";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Chat settings",
    description: "Chat settings page",
  };
};

const ChatSettingsPage = async () => {
  return <ChatSettings />;
};

export default ChatSettingsPage;
