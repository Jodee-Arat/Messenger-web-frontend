"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChangeChatInfoMutation } from "@/shared/graphql/generated/output";
import { useCurrentChat } from "@/shared/hooks/useCurrentChat";
import {
  ChangeInfoChatSchema,
  TypeChangeInfoChatSchema,
} from "@/shared/schemas/chat/change-info-group.schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

const ChangeChatInfoForm = ({ chatId }: { chatId: string }) => {
  const t = useTranslations("settings");
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
      toast.success(t("chatUpdated"));
    },
    onError() {
      toast.error(t("chatUpdateError"));
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
    <FormWrapper heading={t("changeChatInfo")}>
      <Form {...form}>
        <form className="grid gap-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="chatName"
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>{t("chatNameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("chatNamePlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("chatNameDesc")}</FormDescription>
              </FormItem>
            )}
          />
          <Separator />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>{t("chatDescLabel")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("chatDescPlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("chatDescDesc")}</FormDescription>
              </FormItem>
            )}
          ></FormField>
          <Separator />

          <div className="flex justify-end p-5">
            <Button disabled={!isValid || !isDirty || isLoadingInfoUpdate}>
              {t("submit")}
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
