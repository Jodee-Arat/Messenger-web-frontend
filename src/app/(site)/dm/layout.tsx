import { PropsWithChildren } from "react";

import ChatsSidebar from "@/components/layouts/sidebar/chats/ChatsSidebar";

const DirectMessagesLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="flex min-w-0 flex-1">
      <ChatsSidebar groupId="null" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default DirectMessagesLayout;
