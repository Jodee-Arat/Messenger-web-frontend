"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Form, FormField } from "@/components/ui/common/Form";
import { Skeleton } from "@/components/ui/common/Skeleton";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import { FormWrapper } from "@/components/ui/elements/FormWrapper";

import {
  useChangeProfileAvatarMutation,
  useRemoveProfileAvatarMutation,
} from "@/graphql/generated/output";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  TypeUploadFileSchema,
  uploadFileSchema,
} from "@/schemas/upload-file.schema";

const ChangeAvatarForm = () => {
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
        toast.success("Avatar updated successfully");
      },
      onError() {
        toast.error("Error updating avatar");
      },
    });

  const [remove, { loading: isLoadingRemoveAvatar }] =
    useRemoveProfileAvatarMutation({
      onCompleted() {
        refetch();
        toast.success("Avatar removed successfully");
      },
      onError(error) {
        toast.error("Error removing avatar");
      },
    });

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      if (user?.avatarUrl) {
        remove();
      }
      form.setValue("file", file);
      update({
        variables: { avatar: file },
      });
    }
  }

  return isLoadingProfile ? (
    <ChangeAvatarFormSkeleton />
  ) : (
    <FormWrapper heading="Change Avatar">
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
                      onChange={(e) => handleImageChange(e)}
                    />
                    <Button
                      className="mt-5 lg:mt-0"
                      variant="secondary"
                      onClick={() => inputRef.current?.click()}
                      disabled={isLoadingRemoveAvatar || isLoadingUpdateAvatar}
                    >
                      {user?.avatarUrl ? "Change Avatar" : "Upload Avatar"}
                    </Button>
                    {user?.avatarUrl && (
                      <ConfirmModal
                        heading="Remove Avatar"
                        message="Are you sure you want to remove your avatar?"
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
                      ? "Click to change your avatar"
                      : "Upload a new avatar for your profile"}
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
