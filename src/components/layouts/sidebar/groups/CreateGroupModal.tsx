import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, Plus, SquarePen } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import { Checkbox } from "@/components/ui/common/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/common/Dialog";
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
import Hint from "@/components/ui/elements/Hint";

import {
  useCreateChatMutation,
  useCreateGroupMutation,
  useFindAllUsersQuery,
} from "@/graphql/generated/output";

import {
  createGroupSchema,
  createGroupSchemaType,
} from "@/schemas/group/create-group.schema";

import { cn } from "@/utils/tw-merge";

interface CreateGroupModalProp {}

const CreateGroupModal: FC<CreateGroupModalProp> = ({}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
    data,
    loading: isLoadingFindAllUsers,
    refetch,
  } = useFindAllUsersQuery({ skip: !isOpen });

  const form = useForm<createGroupSchemaType>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: "",
      userIds: [],
    },
  });

  const { isValid } = form.formState;

  const users = data?.findAllUsers ?? [];

  const [createGroup, { loading: isLoadingCreate }] = useCreateGroupMutation({
    onCompleted() {
      toast.success("Group created successfully!");
      setIsOpen(false);
      form.reset();
    },
    onError(error) {
      toast.error(`Error creating group: ${error.message}`);
    },
  });

  const onSubmit = (data: createGroupSchemaType) => {
    createGroup({
      variables: {
        data: {
          groupName: data.groupName,
          userIds: data.userIds,
        },
      },
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        } else {
          refetch();
        }
      }}
    >
      <DialogTrigger asChild>
        <Hint label="Add group" asChild side="right">
          <Button
            onClick={() => setIsOpen(true)}
            className={cn("h-11 w-[80%]")}
            size="lg"
            variant="ghost"
          >
            <CirclePlus className="!size-7" />
          </Button>
        </Hint>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter group name"
                      disabled={isLoadingCreate}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoadingFindAllUsers ? (
              <div className="flex items-center justify-center">
                <span>Loading users...</span>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="userIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Users</FormLabel>
                      <FormDescription>
                        Select users to add to the group.
                      </FormDescription>
                    </div>
                    {users.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="userIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item.username}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              disabled={!isValid || isLoadingCreate || isLoadingFindAllUsers}
              type="submit"
            >
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
