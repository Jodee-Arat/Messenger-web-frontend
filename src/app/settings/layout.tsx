import { PropsWithChildren } from "react";

import GroupsSidebar from "@/components/layouts/sidebar/groups/GroupsSidebar";
import HomeSidebar from "@/components/layouts/sidebar/HomeSidebar";
import RouteAccessGuard from "@/components/ui/elements/RouteAccessGuard";

const SettingsLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <RouteAccessGuard scope="auth">
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden md:flex-row">
        <GroupsSidebar />
        <HomeSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </RouteAccessGuard>
  );
};

export default SettingsLayout;
