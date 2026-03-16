import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateGroupMutation,
  useGetFriendsQuery,
} from "@/shared/graphql/generated/output";
import {
  createGroupSchema,
  createGroupSchemaType,
} from "@/shared/schemas/group/create-group.schema";
import { CirclePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { FC, useMemo, useState } from "react";
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
import Hint from "@/components/ui/elements/Hint";

interface CreateGroupModalProp {}

const CreateGroupModal: FC<CreateGroupModalProp> = ({}) => {
  const t = useTranslations("groups");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user: currentUser } = useCurrentUser();

  const {
    data,
    loading: isLoadingFriends,
    refetch,
  } = useGetFriendsQuery({ skip: !isOpen });

  const form = useForm<createGroupSchemaType>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: "",
      userIds: [],
    },
  });

  const { isValid } = form.formState;

  const users = useMemo(() => {
    if (!data?.getFriends || !currentUser?.id) return [];
    return data.getFriends
      .map(f => (f.userId === currentUser.id ? f.friend : f.user))
      .filter((u): u is NonNullable<typeof u> => u != null);
  }, [data?.getFriends, currentUser?.id]);

  const [createGroup, { loading: isLoadingCreate }] = useCreateGroupMutation({
    onCompleted() {
      toast.success(t("groupCreated"));
      setIsOpen(false);
      form.reset();
    },
    onError(error) {
      toast.error(`${t("createError")}${error.message}`);
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
        <Hint label={t("createGroup")} asChild side="right">
          <button
            onClick={() => setIsOpen(true)}
            className="flex size-12 items-center justify-center rounded-[24px] bg-card text-green-500 transition-all hover:rounded-[16px] hover:bg-green-500 hover:text-white"
          >
            <CirclePlus className="size-6" />
          </button>
        </Hint>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createGroup")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("groupName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("groupNamePlaceholder")}
                      disabled={isLoadingCreate}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isLoadingFriends ? (
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
                        {t("selectUsersForGroup")}
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
              disabled={!isValid || isLoadingCreate || isLoadingFriends}
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

export default CreateGroupModal;
