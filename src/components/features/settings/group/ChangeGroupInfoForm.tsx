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

import {
  useChangeGroupInfoMutation,
  useChangeProfileInfoMutation,
} from "@/graphql/generated/output";

import { useCurrentGroup } from "@/hooks/useCurrentGroup";

import {
  ChangeInfoGroupSchema,
  TypeChangeInfoGroupSchema,
} from "@/schemas/group/change-info-group.schema";

const ChangeGroupInfoForm = ({ groupId }: { groupId: string }) => {
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
        toast.success("Group updated successfully");
      },
      onError(error) {
        console.log(error);
        toast.error("Error updating group");
      },
    }
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
    <FormWrapper heading="Change Group Information">
      <Form {...form}>
        <form className="grid gap-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="groupName"
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your group name"
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter a group name</FormDescription>
              </FormItem>
            )}
          />
          <Separator />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem className="px-5 pb-3">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your group description"
                    disabled={isLoadingInfoUpdate}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter a brief group description
                </FormDescription>
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

export default ChangeGroupInfoForm;
