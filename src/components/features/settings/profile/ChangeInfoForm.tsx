"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useChangeProfileInfoMutation } from "@/shared/graphql/generated/output";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  TypeChangeInfoProfileSchema,
  createChangeInfoProfileSchema,
} from "@/shared/schemas/user/change-info-profile.schema";
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

const ChangeInfoForm = () => {
  const t = useTranslations("profileSettings");
  const tValidation = useTranslations("validation");
  const schema = useMemo(
    () => createChangeInfoProfileSchema(tValidation),
    [tValidation],
  );
  const { user, isLoadingProfile, refetch } = useCurrentUser();

  const form = useForm<TypeChangeInfoProfileSchema>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
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
        data: {
          username: data.username.trim(),
          bio: data.bio.trim(),
        },
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
              <FormItem className="px-4 pb-3 sm:px-5">
                <FormLabel>{t("username")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("usernamePlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("enterUniqueUsername")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />

          <FormField
            name="bio"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-4 pb-3 sm:px-5">
                <FormLabel>{t("bio")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("bioPlaceholder")}
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("enterBriefBio")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <Separator />

          <div className="flex justify-end p-4 sm:p-5">
            <Button
              className="w-full sm:w-auto"
              disabled={!isValid || !isDirty || isLoadingInfoUpdate}
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

export default ChangeInfoForm;
