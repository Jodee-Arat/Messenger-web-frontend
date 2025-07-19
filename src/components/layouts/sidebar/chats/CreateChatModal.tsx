import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SquarePen } from "lucide-react";
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

import {
  useCreateChatMutation,
  useFindAllUsersQuery,
} from "@/graphql/generated/output";

import {
  createChatSchema,
  createChatSchemaType,
} from "@/schemas/user/create-chat.schema";

interface CreateChatModalProp {}

const CreateChatModal: FC<CreateChatModalProp> = ({}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const {
    data,
    loading: isLoadingFindAllUsers,
    refetch,
  } = useFindAllUsersQuery({ skip: !isOpen });

  const form = useForm<createChatSchemaType>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      chatName: "",
      userIds: [],
    },
  });

  const { isValid } = form.formState;

  const users = data?.findAllUsers ?? [];

  const [createChat, { loading: isLoadingCreate }] = useCreateChatMutation({
    onCompleted() {
      toast.success("Chat created successfully!");
      setIsOpen(false);
      form.reset();
    },
    onError(error) {
      toast.error(`Error creating chat: ${error.message}`);
    },
  });

  const onSubmit = (data: createChatSchemaType) => {
    createChat({
      variables: {
        data: {
          chatName: data.chatName,
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
        <Button
          className="hover:bg-primary/30 p-0"
          size="lg"
          variant="ghost"
          asChild
        >
          <SquarePen className="size-7.5 p-0.5 px-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create chat</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="chatName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter chat name"
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
                        Select users to add to the chat.
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

export default CreateChatModal;
