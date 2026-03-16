"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUserWEmailMutation } from "@/shared/graphql/generated/output";
import {
  createAccountWEmailSchema,
  createAccountWEmailSchemaType,
} from "@/shared/schemas/auth/create-account-w-email.schema";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/common/Form";
import { Input } from "@/components/ui/common/Input";
import { PasswordInput } from "@/components/ui/common/PasswordInput";

import AuthWrapper from "../AuthWrapper";

const CreateAccountForm = () => {
  const form = useForm<createAccountWEmailSchemaType>({
    resolver: zodResolver(createAccountWEmailSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const t = useTranslations("auth");

  const [create, { loading: isLoadingCreateUserWEmail }] =
    useCreateUserWEmailMutation({
      onCompleted() {
        toast.success(t("accountCreated"));
        window.location.href = "/account/login";
      },
      onError() {
        toast.error(t("somethingWentWrong"));
      },
    });

  const { isValid } = form.formState;

  function onSubmit(data: createAccountWEmailSchemaType) {
    if (isLoadingCreateUserWEmail) return;

    create({
      variables: {
        data,
      },
    });
  }

  return (
    <AuthWrapper
      heading={t("signUp")}
      backButtonHref="/account/login"
      backButtonLabel={t("alreadyHaveAccount")}
      backButtonLinkText={t("login")}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t("enterLogin")}
                    disabled={isLoadingCreateUserWEmail}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t("enterEmail")}
                    type="email"
                    disabled={isLoadingCreateUserWEmail}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    placeholder={t("enterPassword")}
                    disabled={isLoadingCreateUserWEmail}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="mt-2 h-10 w-full rounded-md text-sm font-medium"
            disabled={isLoadingCreateUserWEmail || !isValid}
          >
            {isLoadingCreateUserWEmail ? t("loading") : t("signUp")}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default CreateAccountForm;
