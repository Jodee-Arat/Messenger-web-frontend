"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChangeChatInfoMutation } from "@/shared/graphql/generated/output";
import { useCurrentChat } from "@/shared/hooks/useCurrentChat";
import {
  TypeChangeInfoChatSchema,
  createChangeInfoChatSchema,
} from "@/shared/schemas/chat/change-info-group.schema";
import { useMemo } from "react";
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
  FormMessage,
} from "@/components/ui/common/Form";
import { Input } from "@/components/ui/common/Input";
import { Separator } from "@/components/ui/common/Separator";
import { Skeleton } from "@/components/ui/common/Skeleton";
import { Textarea } from "@/components/ui/common/Textarea";
import { FormWrapper } from "@/components/ui/elements/FormWrapper";

interface ChangeChatInfoFormProps {
  chatId: string;
  canChangeChatInfo?: boolean;
  canChangeChatName?: boolean;
}

const ChangeChatInfoForm = ({
  chatId,
  canChangeChatInfo = false,
  canChangeChatName = false,
}: ChangeChatInfoFormProps) => {
  const t = useTranslations("settings");
  const tValidation = useTranslations("validation");
  const schema = useMemo(
    () => createChangeInfoChatSchema(tValidation),
    [tValidation],
  );
  const { chat, isLoadingChat, refetch } = useCurrentChat(chatId);
  const initialChatName = chat?.chatName ?? "";
  const initialDescription = chat?.description ?? "";

  const form = useForm<TypeChangeInfoChatSchema>({
    resolver: zodResolver(schema),
    values: {
      chatName: initialChatName,
      description: initialDescription,
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
  const currentChatName = form.watch("chatName");
  const currentDescription = form.watch("description");
  const hasEditableChanges =
    (canChangeChatName && currentChatName !== initialChatName) ||
    (canChangeChatInfo && currentDescription !== initialDescription);

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
          {canChangeChatName && (
            <>
              <FormField
                control={form.control}
                name="chatName"
                render={({ field }) => (
                  <FormItem className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                    <FormLabel>{t("chatNameLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("chatNamePlaceholder")}
                        disabled={isLoadingInfoUpdate}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("chatNameDesc")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {canChangeChatInfo && <Separator />}
            </>
          )}

          {canChangeChatInfo && (
            <>
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                    <FormLabel>{t("chatDescLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("chatDescPlaceholder")}
                        disabled={isLoadingInfoUpdate}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("chatDescDesc")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
            </>
          )}

          <div className="flex justify-end p-4 sm:p-5">
            <Button
              className="w-full sm:w-auto"
              disabled={
                !isValid ||
                !isDirty ||
                !hasEditableChanges ||
                isLoadingInfoUpdate
              }
            >
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
