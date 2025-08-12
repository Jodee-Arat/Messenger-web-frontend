import { Metadata } from "next";

import GroupSettings from "@/components/features/settings/group/GroupSettings";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Group settings",
    description: "Group settings page",
  };
};

const GroupSettingsPage = async () => {
  return <GroupSettings />;
};

export default GroupSettingsPage;
