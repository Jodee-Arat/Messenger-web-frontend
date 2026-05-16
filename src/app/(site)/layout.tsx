import { PropsWithChildren } from "react";

import GroupsSidebar from "@/components/layouts/sidebar/groups/GroupsSidebar";

const SiteLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden md:flex-row">
      <GroupsSidebar />
      {children}
    </div>
  );
};

export default SiteLayout;
