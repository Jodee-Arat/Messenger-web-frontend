import { PropsWithChildren } from "react";

import LayoutContainer from "@/components/layouts/LayoutContainer";
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
    <div className="flex h-full flex-col">
      <div className="flex flex-1 py-2">
        <ChatsSidebar groupId={groupId} />
        <LayoutContainer>{children}</LayoutContainer>
      </div>
    </div>
  );
};

export default GroupLayout;
