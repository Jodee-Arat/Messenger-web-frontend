import { Metadata } from "next";

import Chat from "@/components/features/chat/Chat";
import RouteAccessGuard from "@/components/ui/elements/RouteAccessGuard";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Chat",
    description: "Direct message page",
  };
};

const DirectMessagePage = async (props: {
  params: Promise<{ chatId: string }>;
}) => {
  const params = await props.params;

  return (
    <RouteAccessGuard scope="chat" chatId={params.chatId} fallbackHref="/dm">
      <Chat chatId={params.chatId} />
    </RouteAccessGuard>
  );
};

export default DirectMessagePage;
