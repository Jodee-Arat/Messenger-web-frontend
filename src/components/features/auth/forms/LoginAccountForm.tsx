"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginUserMutation } from "@/shared/graphql/generated/output";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  LoginUserSchemaType,
  loginUserSchema,
} from "@/shared/schemas/auth/login-user.schema";
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

const LoginAccountForm = () => {
  const form = useForm<LoginUserSchemaType>({
    resolver: zodResolver(loginUserSchema),
    mode: "onChange",
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const t = useTranslations("auth");

  const { auth } = useAuth();

  const [login, { loading: isLoadingLogin }] = useLoginUserMutation({
    async onCompleted() {
      auth();
      toast.success(t("loginSuccess"));
      window.location.href = "/";
    },
    onError() {
      toast.error(t("somethingWentWrong"));
    },
  });

  const { isValid } = form.formState;

  const onSubmit = (data: LoginUserSchemaType) => {
    login({
      variables: {
        data,
      },
    });
  };

  return (
    <AuthWrapper
      heading={t("login")}
      backButtonHref="/account/create"
      backButtonLabel={t("noAccount")}
      backButtonLinkText={t("register")}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t("enterLogin")}
                    type="text"
                    disabled={isLoadingLogin}
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
                    disabled={isLoadingLogin}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="mt-2 h-10 w-full rounded-md text-sm font-medium"
            disabled={isLoadingLogin || !isValid}
          >
            {isLoadingLogin ? t("loading") : t("login")}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default LoginAccountForm;
