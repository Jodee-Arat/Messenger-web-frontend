"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

import { useLoginUserMutation } from "@/graphql/generated/output";

import { useAuth } from "@/hooks/useAuth";

import {
  LoginUserSchemaType,
  loginUserSchema,
} from "@/schemas/auth/login-user.schema";

import AuthWrapper from "../AuthWrapper";

const LoginAccountForm = () => {
  const form = useForm<LoginUserSchemaType>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const { auth } = useAuth();

  const router = useRouter();

  const [login, { loading: isLoadingLogin }] = useLoginUserMutation({
    onCompleted() {
      auth();
      toast.success("You have successfully logged in");
      setTimeout(() => router.push("/"), 1000);
    },
    onError() {
      toast.error("Something went wrong");
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
      heading="Login on MesArat"
      backButtonHref="/account/create"
      backButtonLabel="Don't have an account? Sign up!"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-3">
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your login"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    disabled={isLoadingLogin}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Пароль должен содержать минимум 8 символов, включая заглавную
                  и строчную буквы, цифру и специальный символ.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="mt-3 w-full" disabled={isLoadingLogin || !isValid}>
            {isLoadingLogin ? "Loading..." : "Login"}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default LoginAccountForm;
