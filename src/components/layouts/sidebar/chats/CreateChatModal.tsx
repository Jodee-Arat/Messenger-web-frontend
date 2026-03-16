import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateChatMutation,
  useFindGroupByGroupIdQuery,
} from "@/shared/graphql/generated/output";
import {
  createChatSchema,
  createChatSchemaType,
} from "@/shared/schemas/user/create-chat.schema";
import { SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

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

interface CreateChatModalProp {
  groupId: string;
}

const CreateChatModal: FC<CreateChatModalProp> = ({ groupId }) => {
  const t = useTranslations("chats");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user: currentUser } = useCurrentUser();

  const {
    data,
    loading: isLoadingMembers,
    refetch,
  } = useFindGroupByGroupIdQuery({
    variables: { groupId },
    skip: !isOpen,
  });

  const form = useForm<createChatSchemaType>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      chatName: "",
      userIds: [],
    },
  });

  const { isValid } = form.formState;

  const users = (data?.findGroupByGroupId?.members ?? [])
    .filter(m => m.user.id !== currentUser?.id)
    .map(m => m.user);

  const [createChat, { loading: isLoadingCreate }] = useCreateChatMutation({
    onCompleted() {
      toast.success(t("chatCreated"));
      setIsOpen(false);
      form.reset();
    },
    onError(error) {
      toast.error(`${t("createChatError")}${error.message}`);
    },
  });

  const onSubmit = (data: createChatSchemaType) => {
    createChat({
      variables: {
        groupId,
        data: {
          chatName: data.chatName,
          userIds: data.userIds,
          isGroup: true,
          isSecret: false,
        },
      },
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
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
          <DialogTitle>{t("createChat")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="chatName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("chatName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("chatNamePlaceholder")}
                      disabled={isLoadingCreate}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoadingMembers ? (
              <div className="flex items-center justify-center">
                <span>{t("loadingUsers")}</span>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="userIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        {t("usersLabel")}
                      </FormLabel>
                      <FormDescription>
                        {t("selectUsersForChat")}
                      </FormDescription>
                    </div>
                    {users.map(item => (
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
                                  onCheckedChange={checked => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            value => value !== item.id,
                                          ),
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
              disabled={!isValid || isLoadingCreate || isLoadingMembers}
              type="submit"
            >
              {t("submit")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatModal;
