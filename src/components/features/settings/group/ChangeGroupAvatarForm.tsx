"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useChangeGroupAvatarMutation,
  useRemoveGroupAvatarMutation,
} from "@/shared/graphql/generated/output";
import { useCurrentGroup } from "@/shared/hooks/useCurrentGroup";
import {
  TypeUploadFileSchema,
  uploadFileSchema,
} from "@/shared/schemas/upload-file.schema";
import { Trash } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";
import { Form, FormField } from "@/components/ui/common/Form";
import { Skeleton } from "@/components/ui/common/Skeleton";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import { FormWrapper } from "@/components/ui/elements/FormWrapper";

const ChangeGroupAvatarForm = ({ groupId }: { groupId: string }) => {
  const t = useTranslations("settings");
  const tP = useTranslations("profileSettings");
  const { group, isLoadingGroup, refetch } = useCurrentGroup(groupId);

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TypeUploadFileSchema>({
    resolver: zodResolver(uploadFileSchema),
    values: {
      file: group?.avatarUrl!,
    },
  });

  const [update, { loading: isLoadingUpdateAvatar }] =
    useChangeGroupAvatarMutation({
      onCompleted(data) {
        if (data?.changeGroupAvatar) {
          refetch();
        }
        toast.success(tP("avatarUpdated"));
      },
      onError() {
        toast.error(tP("errorUpdatingAvatar"));
      },
    });

  const [remove, { loading: isLoadingRemoveAvatar }] =
    useRemoveGroupAvatarMutation({
      onCompleted() {
        refetch();
        toast.success(tP("avatarRemoved"));
      },
      onError(error) {
        toast.error(tP("errorRemovingAvatar"));
      },
    });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      form.setValue("file", file);
      update({
        variables: { avatar: file, groupId },
      });
    }
  }

  return isLoadingGroup ? (
    <ChangeAvatarFormSkeleton />
  ) : (
    <FormWrapper heading={t("changeGroupAvatar")}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <div className="px-5 pb-5">
              <div className="w-full items-center space-x-6 lg:flex">
                <EntityAvatar
                  size="xl"
                  avatarUrl={group?.avatarUrl || null}
                  name={group?.groupName}
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-x-3">
                    <input
                      className="hidden"
                      type="file"
                      ref={inputRef}
                      onChange={e => handleImageChange(e)}
                    />
                    <Button
                      className="mt-5 lg:mt-0"
                      variant="secondary"
                      onClick={() => inputRef.current?.click()}
                      disabled={isLoadingRemoveAvatar || isLoadingUpdateAvatar}
                    >
                      {group?.avatarUrl
                        ? t("changeGroupAvatar")
                        : tP("uploadAvatar")}
                    </Button>
                    {group?.avatarUrl && (
                      <ConfirmModal
                        heading={tP("removeAvatar")}
                        message={t("removeGroupAvatarConfirm")}
                        onConfirm={() =>
                          remove({
                            variables: {
                              groupId,
                            },
                          })
                        }
                      >
                        <Button
                          className=""
                          variant="ghost"
                          disabled={
                            isLoadingRemoveAvatar || isLoadingUpdateAvatar
                          }
                          size="lgIcon"
                        >
                          <Trash className="size-4" />
                        </Button>
                      </ConfirmModal>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {group?.avatarUrl
                      ? t("groupAvatarDesc")
                      : t("uploadGroupAvatar")}
                  </p>
                </div>
              </div>
            </div>
          )}
        />
      </Form>
    </FormWrapper>
  );
};

export const ChangeAvatarFormSkeleton = () => {
  return <Skeleton className="h-52 w-full" />;
};
export default ChangeGroupAvatarForm;
