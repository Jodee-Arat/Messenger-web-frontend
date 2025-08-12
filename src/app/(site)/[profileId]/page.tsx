import { Metadata } from "next";

import Profile from "@/components/features/profile/Profile";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Profile",
    description: "Profile page",
  };
};

const ProfileIdPage = async (props: {
  params: Promise<{ profileId: string }>;
}) => {
  const params = await props.params;
  const profileId = params.profileId;

  return <Profile profileId={profileId} />;
};

export default ProfileIdPage;
