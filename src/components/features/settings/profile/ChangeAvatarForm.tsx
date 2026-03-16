"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useChangeProfileAvatarMutation,
  useRemoveProfileAvatarMutation,
} from "@/shared/graphql/generated/output";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
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

const ChangeAvatarForm = () => {
  const t = useTranslations("profileSettings");
  const { user, isLoadingProfile, refetch } = useCurrentUser();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TypeUploadFileSchema>({
    resolver: zodResolver(uploadFileSchema),
    values: {
      file: user?.avatarUrl!,
    },
  });

  const [update, { loading: isLoadingUpdateAvatar }] =
    useChangeProfileAvatarMutation({
      onCompleted(data) {
        if (data?.changeProfileAvatar) {
          refetch();
        }
        toast.success(t("avatarUpdated"));
      },
      onError() {
        toast.error(t("errorUpdatingAvatar"));
      },
    });

  const [remove, { loading: isLoadingRemoveAvatar }] =
    useRemoveProfileAvatarMutation({
      onCompleted() {
        refetch();
        toast.success(t("avatarRemoved"));
      },
      onError(error) {
        toast.error(t("errorRemovingAvatar"));
      },
    });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      form.setValue("file", file);
      update({
        variables: { avatar: file },
      });
    }
  }

  return isLoadingProfile ? (
    <ChangeAvatarFormSkeleton />
  ) : (
    <FormWrapper heading={t("changeAvatar")}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <div className="px-5 pb-5">
              <div className="w-full items-center space-x-6 lg:flex">
                <EntityAvatar
                  size="xl"
                  avatarUrl={user?.avatarUrl || null}
                  name={user?.username}
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
                      {user?.avatarUrl ? t("changeAvatar") : t("uploadAvatar")}
                    </Button>
                    {user?.avatarUrl && (
                      <ConfirmModal
                        heading={t("removeAvatar")}
                        message={t("removeAvatarConfirm")}
                        onConfirm={() => remove()}
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
                    {user?.avatarUrl
                      ? t("clickToChangeAvatar")
                      : t("uploadNewAvatar")}
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
export default ChangeAvatarForm;
