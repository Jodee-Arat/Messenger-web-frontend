"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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

import { useCreateUserWEmailMutation } from "@/graphql/generated/output";

import {
  createAccountWEmailSchema,
  createAccountWEmailSchemaType,
} from "@/schemas/auth/create-account-w-email.schema";

import AuthWrapper from "../AuthWrapper";

const CreateAccountForm = () => {
  // const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<createAccountWEmailSchemaType>({
    resolver: zodResolver(createAccountWEmailSchema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const [create, { loading: isLoadingCreateUserWEmail }] =
    useCreateUserWEmailMutation({
      onCompleted() {
        toast.success("You have successfully created an account");
        setTimeout(() => router.push("/"), 1000);
      },
      onError() {
        toast.error("Something went wrong");
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
      heading="Register on MesArat"
      backButtonHref="/account/login"
      backButtonLabel="Already have an account? Sign in"
    >
      {/* {isSuccess ? (
			<Alert>
				<CircleCheck className="size-4"/>
				<AlertTitle>Check your email</AlertTitle>
				<AlertDescription>A verification email has been sent to your inbox. If you don't see the email, check your spam folder</AlertDescription>
			</Alert>
		)} */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-3">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Johndoe"
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Gnomi123@gmail.com"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    disabled={isLoadingCreateUserWEmail}
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
          <Button
            className="mt-3 w-full"
            disabled={isLoadingCreateUserWEmail || !isValid}
          >
            {isLoadingCreateUserWEmail ? "Loading..." : "Register"}
          </Button>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default CreateAccountForm;
