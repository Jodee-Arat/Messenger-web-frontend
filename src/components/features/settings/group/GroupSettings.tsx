"use client";

import { useParams } from "next/navigation";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import Heading from "@/components/ui/elements/Heading";

import ChangeGroupAvatarForm from "./ChangeGroupAvatarForm";
import ChangeGroupInfoForm from "./ChangeGroupInfoForm";

const GroupSettings = () => {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;

  return (
    <div className="mt-[82px] lg:px-10">
      <Heading
        title="Group Settings"
        description="Manage your group settings"
        size="lg"
      />
      <Tabs defaultValue="Group" className="mt-3 w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="Group">Group</TabsTrigger>
          <TabsTrigger value="Users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="Group">
          <div className="mt-5 space-y-6">
            <Heading title="Group" description="Manage your group settings" />
            <ChangeGroupAvatarForm groupId={groupId} />
            <ChangeGroupInfoForm groupId={groupId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupSettings;
