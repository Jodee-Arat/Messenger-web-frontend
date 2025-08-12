"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/common/Form";
import { Input } from "@/components/ui/common/Input";
import { Separator } from "@/components/ui/common/Separator";
import { Skeleton } from "@/components/ui/common/Skeleton";
import { Textarea } from "@/components/ui/common/Textarea";
import { FormWrapper } from "@/components/ui/elements/FormWrapper";

import { useChangeChatInfoMutation } from "@/graphql/generated/output";

import { useCurrentChat } from "@/hooks/useCurrentChat";

import {
  ChangeInfoChatSchema,
  TypeChangeInfoChatSchema,
} from "@/schemas/chat/change-info-group.schema";

const ChangeChatInfoForm = ({ chatId }: { chatId: string }) => {
  const { chat, isLoadingChat, refetch } = useCurrentChat(chatId);

  const form = useForm<TypeChangeInfoChatSchema>({
    resolver: zodResolver(ChangeInfoChatSchema),
    values: {
      chatName: chat?.chatName ?? "",
      description: chat?.description ?? "",
    },
  });

  const [update, { loading: isLoadingInfoUpdate }] = useChangeChatInfoMutation({
    onCompleted() {
      refetch();
      toast.success("Chat updated successfully");
    },
    onError() {
      toast.error("Error updating chat");
    },
  });

  const { isValid, isDirty } = form.formState;

  const onSubmit = (data: TypeChangeInfoChatSchema) => {
    update({
      variables: {
        data,
        chatId,
      },
    });
  };

  return isLoadingChat ? (
    <ChangeInfoFormSkeleton />
  ) : (
    <FormWrapper heading="Change Chat Information">
      <Form {...form}>
        <form className="grid gap-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="chatName"
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>Chat Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your chat name"
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter a chat name</FormDescription>
              </FormItem>
            )}
          />
          <Separator />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your chat description"
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter a brief chat description
                </FormDescription>
              </FormItem>
            )}
          ></FormField>
          <Separator />

          <div className="flex justify-end p-5">
            <Button disabled={!isValid || !isDirty || isLoadingInfoUpdate}>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </FormWrapper>
  );
};

export const ChangeInfoFormSkeleton = () => {
  return <Skeleton className="h-96 w-full" />;
};

export default ChangeChatInfoForm;
