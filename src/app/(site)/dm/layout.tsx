import { PropsWithChildren } from "react";

import ChatsSidebar from "@/components/layouts/sidebar/chats/ChatsSidebar";

const DirectMessagesLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
      <ChatsSidebar groupId="null" />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default DirectMessagesLayout;
