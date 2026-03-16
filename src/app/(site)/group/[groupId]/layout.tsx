import { PropsWithChildren } from "react";

import ChatsSidebar from "@/components/layouts/sidebar/chats/ChatsSidebar";

type LayoutProps = PropsWithChildren<{
  params: { groupId: string };
}>;

const GroupLayout = async ({
  children,
  params: paramsPromise,
}: LayoutProps & { params: Promise<{ groupId: string }> }) => {
  const params = await paramsPromise;
  const groupId = params.groupId;
  return (
    <div className="flex min-w-0 flex-1">
      <ChatsSidebar groupId={groupId} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default GroupLayout;
