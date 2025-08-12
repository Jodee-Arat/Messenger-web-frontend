import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import Heading from "@/components/ui/elements/Heading";

import ChangeAvatarForm from "./ChangeAvatarForm";
import ChangeInfoForm from "./ChangeInfoForm";

const UserSettings = () => {
  return (
    <div className="mt-[82px] lg:px-10">
      <Heading
        title="User Settings"
        description="Manage your account settings"
        size="lg"
      />
      <Tabs defaultValue="profile" className="mt-3 w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="mt-5 space-y-6">
            <Heading
              title="Profile Settings"
              description="Manage your profile settings"
            />
            <ChangeAvatarForm />
            <ChangeInfoForm />
            {/* <SocialLinksForm /> */}
          </div>
        </TabsContent>
        {/* <TabsContent value="account">
          <div className="mt-5 space-y-6">
            <Heading
              title={t("account.header.heading")}
              description={t("account.header.description")}
            />
            <ChangeEmailForm />
            <ChangePasswordForm />
            <Heading
              title={t("account.header.securityHeading")}
              description={t("account.header.securityDescription")}
            />
            <WrapperTOTP />
            
          </div>
        </TabsContent> */}
        {/*  <TabsContent value="appearance">
          <div className="mt-5 space-y-6">
            <Heading
              title={t("appearance.header.heading")}
              description={t("appearance.header.description")}
            />
            <ChangeThemeForm />
            <ChangeLanguageForm />
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="mt-5 space-y-6">
            <Heading
              title={t("notifications.header.heading")}
              description={t("notifications.header.description")}
            />
            <ChangeNotificationSettingsForm />
          </div>
        </TabsContent>
        <TabsContent value="sessions">
          <div className="mt-5 space-y-6">
            <Heading
              title={t("sessions.header.heading")}
              description={t("sessions.header.description")}
            />
            <SessionsList />
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default UserSettings;
