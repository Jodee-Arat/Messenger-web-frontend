"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChangeGroupInfoMutation } from "@/shared/graphql/generated/output";
import { useCurrentGroup } from "@/shared/hooks/useCurrentGroup";
import {
  TypeChangeInfoGroupSchema,
  createChangeInfoGroupSchema,
} from "@/shared/schemas/group/change-info-group.schema";
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

interface ChangeGroupInfoFormProps {
  groupId: string;
  canChangeGroupInfo?: boolean;
  canChangeGroupName?: boolean;
}

const ChangeGroupInfoForm = ({
  groupId,
  canChangeGroupInfo = false,
  canChangeGroupName = false,
}: ChangeGroupInfoFormProps) => {
  const t = useTranslations("settings");
  const tValidation = useTranslations("validation");
  const schema = useMemo(
    () => createChangeInfoGroupSchema(tValidation),
    [tValidation],
  );
  const { group, isLoadingGroup, refetch } = useCurrentGroup(groupId);
  const initialGroupName = group?.groupName ?? "";
  const initialDescription = group?.description ?? "";

  const form = useForm<TypeChangeInfoGroupSchema>({
    resolver: zodResolver(schema),
    values: {
      groupName: initialGroupName,
      description: initialDescription,
    },
  });

  const [update, { loading: isLoadingInfoUpdate }] = useChangeGroupInfoMutation(
    {
      onCompleted() {
        refetch();
        toast.success(t("groupUpdated"));
      },
      onError(error) {
        console.log(error);
        toast.error(t("groupUpdateError"));
      },
    },
  );

  const { isValid, isDirty } = form.formState;
  const currentGroupName = form.watch("groupName");
  const currentDescription = form.watch("description");
  const hasEditableChanges =
    (canChangeGroupName && currentGroupName !== initialGroupName) ||
    (canChangeGroupInfo && currentDescription !== initialDescription);

  const onSubmit = (data: TypeChangeInfoGroupSchema) => {
    update({
      variables: {
        data,
        groupId,
      },
    });
  };

  return isLoadingGroup ? (
    <ChangeInfoFormSkeleton />
  ) : (
    <FormWrapper heading={t("changeGroupInfo")}>
      <Form {...form}>
        <form className="grid gap-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          {canChangeGroupName && (
            <>
              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem className="px-4 pb-3 sm:px-5">
                    <FormLabel>{t("groupNameLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("groupNamePlaceholder")}
                        disabled={isLoadingInfoUpdate}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("groupNameDesc")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {canChangeGroupInfo && <Separator />}
            </>
          )}

          {canChangeGroupInfo && (
            <>
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="px-4 pb-3 sm:px-5">
                    <FormLabel>{t("groupDescLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("groupDescPlaceholder")}
                        disabled={isLoadingInfoUpdate}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("groupDescDesc")}</FormDescription>
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

export default ChangeGroupInfoForm;
