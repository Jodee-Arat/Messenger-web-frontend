"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@/components/ui/common/Form";
import { Input } from "@/components/ui/common/Input";
import { Separator } from "@/components/ui/common/Separator";
import { Skeleton } from "@/components/ui/common/Skeleton";
import { Textarea } from "@/components/ui/common/Textarea";
import { FormWrapper } from "@/components/ui/elements/FormWrapper";

import { useChangeProfileInfoMutation } from "@/graphql/generated/output";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  ChangeInfoProfileSchema,
  TypeChangeInfoProfileSchema,
} from "@/schemas/user/change-info-profile.schema";

const ChangeInfoForm = () => {
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
        toast.success("Profile updated   successfully");
      },
      onError() {
        toast.error("Error updating profile");
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
    <FormWrapper heading="Change Profile Information">
      <Form {...form}>
        <form className="grid gap-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your username"
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter a unique username</FormDescription>
              </FormItem>
            )}
          />
          <Separator />

          <FormField
            name="bio"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your bio"
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter a brief bio</FormDescription>
              </FormItem>
            )}
          ></FormField>
          <Separator />

          <div className="flex justify-end p-5">
            <Button disabled={!isValid || !isDirty || isLoadingInfoUpdate}>
              Submit
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
