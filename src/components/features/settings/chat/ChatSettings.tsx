"use client";

import { useParams } from "next/navigation";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import Heading from "@/components/ui/elements/Heading";

import ChangeChatAvatarForm from "./ChangeChatAvatarForm";
import ChangeChatInfoForm from "./ChangeChatInfoForm";

const ChatSettings = () => {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;

  return (
    <div className="mt-[82px] lg:px-10">
      <Heading
        title="Chat Settings"
        description="Manage your chat settings"
        size="lg"
      />
      <Tabs defaultValue="Chat" className="mt-3 w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="Chat">Chat</TabsTrigger>
          <TabsTrigger value="Users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="Chat">
          <div className="mt-5 space-y-6">
            <Heading title="Chat" description="Manage your chat settings" />
            <ChangeChatAvatarForm chatId={chatId} />
            <ChangeChatInfoForm chatId={chatId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatSettings;
