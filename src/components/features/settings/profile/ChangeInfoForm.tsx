"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChangeProfileInfoMutation } from "@/shared/graphql/generated/output";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  ChangeInfoProfileSchema,
  TypeChangeInfoProfileSchema,
} from "@/shared/schemas/user/change-info-profile.schema";
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

const ChangeInfoForm = () => {
  const t = useTranslations("profileSettings");
  const { user, isLoadingProfile, refetch } = useCurrentUser();

  const form = useForm<TypeChangeInfoProfileSchema>({
    resolver: zodResolver(ChangeInfoProfileSchema),
    values: {
      username: user?.username ?? "",
      bio: user?.bio ?? "",
    },
  });

  const [update, { loading: isLoadingInfoUpdate }] =
    useChangeProfileInfoMutation({
      onCompleted() {
        refetch();
        toast.success(t("profileUpdated"));
      },
      onError() {
        toast.error(t("updateFailed"));
      },
    });

  const { isValid, isDirty } = form.formState;

  const onSubmit = (data: TypeChangeInfoProfileSchema) => {
    update({
      variables: {
        data,
      },
    });
  };

  return isLoadingProfile ? (
    <ChangeInfoFormSkeleton />
  ) : (
    <FormWrapper heading={t("changeProfileInfo")}>
      <Form {...form}>
        <form className="grid gap-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>{t("username")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("usernamePlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("enterUniqueUsername")}</FormDescription>
              </FormItem>
            )}
          />
          <Separator />

          <FormField
            name="bio"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>{t("bio")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("bioPlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("enterBriefBio")}</FormDescription>
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

export default ChangeInfoForm;
