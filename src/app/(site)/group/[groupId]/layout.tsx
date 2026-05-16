import { PropsWithChildren } from "react";

import ChatsSidebar from "@/components/layouts/sidebar/chats/ChatsSidebar";
import RouteAccessGuard from "@/components/ui/elements/RouteAccessGuard";

type LayoutProps = PropsWithChildren<{
  params: Promise<{ groupId: string }>;
}>;

const GroupLayout = async ({
  children,
  params: paramsPromise,
}: LayoutProps) => {
  const params = await paramsPromise;
  const groupId = params.groupId;
  const isDirectRoute = groupId === "null";
  const layoutContent = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
      <ChatsSidebar groupId={groupId} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );

  if (isDirectRoute) {
    return layoutContent;
  }

  return (
    <RouteAccessGuard scope="group" groupId={groupId} fallbackHref="/">
      {layoutContent}
    </RouteAccessGuard>
  );
};

export default GroupLayout;
