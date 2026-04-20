import { PropsWithChildren } from "react";

import ChatsSidebar from "@/components/layouts/sidebar/chats/ChatsSidebar";
import RouteAccessGuard from "@/components/ui/elements/RouteAccessGuard";

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
    <RouteAccessGuard scope="group" groupId={groupId} fallbackHref="/">
      <div className="flex min-w-0 flex-1">
        <ChatsSidebar groupId={groupId} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </RouteAccessGuard>
  );
};

export default GroupLayout;
