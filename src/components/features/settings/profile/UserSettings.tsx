"use client";

import { useTranslations } from "next-intl";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import Heading from "@/components/ui/elements/Heading";

import ChangeAvatarForm from "./ChangeAvatarForm";
import ChangeInfoForm from "./ChangeInfoForm";
import TotpSettings from "./TotpSettings";
import AppearanceSettings from "./AppearanceSettings";
import SessionsList from "./SessionsList";

const UserSettings = () => {
  const tS = useTranslations("settings");
  const tP = useTranslations("profileSettings");
  const tA = useTranslations("appearance");
  const tSes = useTranslations("sessions");

  return (
    <div className="lg:px-10">
      <Heading
        title={tS("userSettings")}
        description={tS("manageAccount")}
        size="lg"
      />
      <Tabs defaultValue="profile" className="mt-3 w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">{tP("profileTab")}</TabsTrigger>
          <TabsTrigger value="security">{tP("securityTab")}</TabsTrigger>
          <TabsTrigger value="appearance">{tP("appearanceTab")}</TabsTrigger>
          <TabsTrigger value="sessions">{tP("sessionsTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="mt-5 space-y-6">
            <Heading
              title={tS("profileSettingsTitle")}
              description={tS("manageProfileSettings")}
            />
            <ChangeAvatarForm />
            <ChangeInfoForm />
          </div>
        </TabsContent>
        <TabsContent value="security">
          <div className="mt-5 space-y-6">
            <Heading
              title={tS("securityTitle")}
              description={tS("manageSecurity")}
            />
            <TotpSettings />
          </div>
        </TabsContent>
        <TabsContent value="appearance">
          <div className="mt-5 space-y-6">
            <Heading
              title={tA("title")}
              description={tS("customizeAppearance")}
            />
            <AppearanceSettings />
          </div>
        </TabsContent>
        <TabsContent value="sessions">
          <div className="mt-5 space-y-6">
            <Heading title={tSes("title")} description={tS("manageSessions")} />
            <SessionsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;
