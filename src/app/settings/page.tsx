import { Metadata } from "next";

import UserSettings from "@/components/features/settings/profile/UserSettings";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Profile settings",
    description: "Profile settings page",
  };
};

const ProfileIdPage = async () => {
  return <UserSettings />;
};

export default ProfileIdPage;
