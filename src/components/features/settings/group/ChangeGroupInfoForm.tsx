"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChangeGroupInfoMutation } from "@/shared/graphql/generated/output";
import { useCurrentGroup } from "@/shared/hooks/useCurrentGroup";
import {
  ChangeInfoGroupSchema,
  TypeChangeInfoGroupSchema,
} from "@/shared/schemas/group/change-info-group.schema";
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

const ChangeGroupInfoForm = ({ groupId }: { groupId: string }) => {
  const t = useTranslations("settings");
  const { group, isLoadingGroup, refetch } = useCurrentGroup(groupId);

  const form = useForm<TypeChangeInfoGroupSchema>({
    resolver: zodResolver(ChangeInfoGroupSchema),
    values: {
      groupName: group?.groupName ?? "",
      description: group?.description ?? "",
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
          <FormField
            control={form.control}
            name="groupName"
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>{t("groupNameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("groupNamePlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("groupNameDesc")}</FormDescription>
              </FormItem>
            )}
          />
          <Separator />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>{t("groupDescLabel")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("groupDescPlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("groupDescDesc")}</FormDescription>
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

export default ChangeGroupInfoForm;
