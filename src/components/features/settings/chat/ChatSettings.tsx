"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  LogOut,
  LockKeyhole,
  MessageCircle,
  Trash2,
  Users,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
import BackButton from "@/components/ui/elements/BackButton";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import ChangeChatAvatarForm from "./ChangeChatAvatarForm";
import ChangeChatInfoForm from "./ChangeChatInfoForm";
import ChatRolesSection from "./ChatRolesSection";
import ChatMembersSection from "./ChatMembersSection";

import { useCurrentChat } from "@/shared/hooks/useCurrentChat";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  ChatPermissionEnum,
  useChatDeletedSubscription,
  useDeleteChatMutation,
  useGetChatRolesQuery,
  useGetMemberChatRoleQuery,
  useLeaveChatMutation,
  useChatUpsertedRoleSubscription,
  useChatDeletedRoleSubscription,
  useChatAssignedRoleSubscription,
  useChatRemovedRoleSubscription,
  useUpsertChatRoleMutation,
  useDeleteChatRoleMutation,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
  useInviteMemberToChatMutation,
  useRemoveMemberFromChatMutation,
  type GetChatRolesQuery,
} from "@/shared/graphql/generated/output";

type ChatRoleData = GetChatRolesQuery["getChatRoles"][0];

const ChatSettings = () => {
  const t = useTranslations("settings");
  const tC = useTranslations("chats");
  const params = useParams<{ chatId: string; groupId: string }>();
  const chatId = params.chatId;
  const groupId = params.groupId;
  const router = useRouter();
  const handledAccessLossRef = useRef(false);
  const { user } = useCurrentUser();
  const { chat, isLoadingChat, refetch: refetchChat } = useCurrentChat(chatId);

  const isGroup = !!chat?.isGroup;
  const isDM = !!chat && !chat.isGroup;
  const members = chat?.members ?? [];
  const counterpartMember =
    (isDM
      ? (members.find((member) => member.user.id !== user?.id) ?? members[0])
      : null) ?? null;

  const displayName =
    counterpartMember?.user.username ?? chat?.chatName ?? t("chatFallback");
  const displayAvatarUrl =
    counterpartMember?.user.avatarUrl ?? chat?.avatarUrl ?? null;
  const displayDescription = chat?.description?.trim() ?? "";
  const subscriptionGroupId = groupId === "null" ? "" : groupId;
  const handleChatAccessLoss = useCallback(() => {
    if (handledAccessLossRef.current) return;

    handledAccessLossRef.current = true;
    router.replace(groupId === "null" ? "/dm" : `/group/${groupId}`);
  }, [groupId, router]);

  const { data: roleData, loading: isLoadingMemberRole } =
    useGetMemberChatRoleQuery({
      variables: { chatId },
      skip: !isGroup,
    });

  useChatDeletedSubscription({
    variables: {
      groupId: subscriptionGroupId,
      userId: user?.id ?? "",
    },
    skip: !user?.id,
    onData: ({ data }) => {
      if (data.data?.chatDeleted.id !== chatId) return;
      handleChatAccessLoss();
    },
  });

  const { data: rolesData, refetch: refetchRoles } = useGetChatRolesQuery({
    variables: { chatId },
    skip: !isGroup,
    fetchPolicy: "network-only",
  });

  const [roles, setRoles] = useState<ChatRoleData[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rolesData?.getChatRoles) setRoles(rolesData.getChatRoles);
  }, [rolesData]);

  useEffect(() => {
    handledAccessLossRef.current = false;
  }, [chatId]);

  useEffect(() => {
    if (members.length > 0) {
      const mapping: Record<string, string> = {};
      for (const member of members) {
        if (member.roles && member.roles.length > 0) {
          mapping[member.user.id] = member.roles[0].id;
        }
      }
      setUserRoles(mapping);
    }
  }, [members]);

  const currentRole = roleData?.getMemberChatRole;
  const isCreator = !!currentRole?.isCreator;
  const perms = (currentRole?.permissions ?? []) as ChatPermissionEnum[];

  const canChangeChatInfo =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.ChangeChatInfo));
  const canChangeChatName =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.ChangeChatName));
  const canChangeChatAvatar =
    isGroup &&
    (isCreator || perms.includes(ChatPermissionEnum.ChangeChatAvatar));
  const canManageMembers =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.RemoveMembers));
  const canManageRoles =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.ManageRoles));
  const canCreateRoles =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.CreateRoles));
  const canDeleteRoles =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.DeleteRoles));
  const canChangeRoleInfo =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.ChangeRoleInfo));
  const canInviteMembers =
    isGroup && (isCreator || perms.includes(ChatPermissionEnum.InviteMembers));
  const canAccessRoles =
    canManageRoles || canCreateRoles || canDeleteRoles || canChangeRoleInfo;
  const canDeleteChat = isDM || isCreator;
  const canLeaveChat = isGroup && !isCreator;

  useChatUpsertedRoleSubscription({
    variables: { chatId },
    skip: !isGroup,
    onData: ({ data: subData }) => {
      const upserted = subData.data?.chatUpsertedRole;
      if (!upserted) return;
      setRoles((prev) => {
        const idx = prev.findIndex((r) => r.id === upserted.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = upserted;
          return copy;
        }
        return [...prev, upserted];
      });
    },
  });

  useChatDeletedRoleSubscription({
    variables: { chatId },
    skip: !isGroup,
    onData: ({ data: subData }) => {
      const deleted = subData.data?.chatDeletedRole;
      if (!deleted) return;
      setRoles((prev) => prev.filter((r) => r.id !== deleted.id));
      setUserRoles((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((uid) => {
          if (copy[uid] === deleted.id) delete copy[uid];
        });
        return copy;
      });
    },
  });

  useChatAssignedRoleSubscription({
    variables: { chatId },
    skip: !isGroup,
    onData: () => {
      refetchRoles();
      refetchChat();
    },
  });

  useChatRemovedRoleSubscription({
    variables: { chatId },
    skip: !isGroup,
    onData: () => {
      refetchRoles();
      refetchChat();
    },
  });

  const [upsertChatRole] = useUpsertChatRoleMutation();
  const [deleteChatRole] = useDeleteChatRoleMutation();
  const [assignChatRole] = useAssignRoleToUserMutation();
  const [removeChatRole] = useRemoveRoleFromUserMutation();
  const [inviteMember] = useInviteMemberToChatMutation();
  const [removeMember] = useRemoveMemberFromChatMutation();

  const [deleteChat] = useDeleteChatMutation({
    onCompleted() {
      toast.success(t("chatDeleted"));
      router.replace(isDM ? "/dm" : `/group/${groupId}`);
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const [leaveChat] = useLeaveChatMutation({
    onCompleted() {
      toast.success(t("leftChat"));
      router.push(`/group/${groupId}`);
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const handleCreateRole = async (
    name: string,
    color: string,
    permissions: ChatPermissionEnum[],
  ) => {
    await upsertChatRole({
      variables: { chatId, data: { name, color, permissions } },
    });
  };

  const handleDeleteRole = async (roleId: string) => {
    await deleteChatRole({ variables: { chatId, roleId } });
  };

  const handleTogglePermission = async (
    role: ChatRoleData,
    permKey: ChatPermissionEnum,
  ) => {
    const has = role.permissions.includes(permKey);
    const newPerms = has
      ? role.permissions.filter((p) => p !== permKey)
      : [...role.permissions, permKey];

    await upsertChatRole({
      variables: {
        chatId,
        data: { name: role.name, color: role.color, permissions: newPerms },
      },
    });

    setRoles((prev) =>
      prev.map((r) => (r.id === role.id ? { ...r, permissions: newPerms } : r)),
    );
  };

  const handleAssignRole = async (memberId: string, roleId: string) => {
    const currentRoleId = userRoles[memberId];
    if (currentRoleId) {
      await removeChatRole({
        variables: { chatId, roleId: currentRoleId, memberId },
      });
    }
    if (roleId && roleId !== currentRoleId) {
      await assignChatRole({ variables: { chatId, roleId, memberId } });
      setUserRoles((prev) => ({ ...prev, [memberId]: roleId }));
    } else {
      setUserRoles((prev) => {
        const copy = { ...prev };
        delete copy[memberId];
        return copy;
      });
    }
  };

  const handleInviteMember = async (targetUserId: string) => {
    try {
      await inviteMember({ variables: { chatId, targetUserId } });
      refetchChat();
      toast.success(t("memberInvited"));
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : t("somethingWentWrong");
      toast.error(errorMessage);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    try {
      await removeMember({ variables: { chatId, targetUserId } });
      refetchChat();
      toast.success(t("memberRemoved"));
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : t("somethingWentWrong");
      toast.error(errorMessage);
    }
  };

  const getRoleForUser = (userId: string): ChatRoleData | undefined => {
    const roleId = userRoles[userId];
    return roleId ? roles.find((r) => r.id === roleId) : undefined;
  };

  const getMembersWithRole = (roleId: string) =>
    members.filter((m) => userRoles[m.user.id] === roleId);

  if (isLoadingChat || isLoadingMemberRole) {
    return (
      <div className="flex h-full flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:px-10 xl:px-12">
          <BackButton
            href={`/group/${groupId}/${chatId}`}
            className="mb-4 h-11 w-fit px-5 text-sm"
          />
          <div className="rounded-[32px] border border-border/60 bg-card/70 p-8 shadow-sm">
            <h1 className="text-foreground text-3xl font-semibold">
              {t("chatSettingsTitle")}
            </h1>
            <p className="text-muted-foreground mt-2">{t("loadingSettings")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-10 xl:px-12">
        <BackButton
          href={`/group/${groupId}/${chatId}`}
          className="mb-4 h-11 w-fit px-5 text-sm"
        />

        <Card className="rounded-[28px] border-border/60 bg-card/70 shadow-sm">
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-6 pt-6 sm:gap-8 sm:pt-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <div className="rounded-[28px] border border-primary/20 bg-background/70 p-2 shadow-sm">
                  <EntityAvatar
                    size="xl"
                    avatarUrl={displayAvatarUrl}
                    name={displayName}
                  />
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="text-muted-foreground inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em]">
                    {isDM ? (
                      <MessageCircle className="size-3.5 shrink-0" />
                    ) : (
                      <Users className="size-3.5 shrink-0" />
                    )}
                    <span className="truncate">{t("chatSettingsTitle")}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-foreground break-words text-3xl font-semibold tracking-tight xl:text-4xl">
                        {displayName}
                      </h1>
                      {chat?.isSecret && (
                        <span className="bg-primary/10 text-primary inline-flex size-10 shrink-0 items-center justify-center rounded-full">
                          <LockKeyhole className="size-4" />
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground max-w-2xl break-words text-sm leading-6">
                      {displayDescription || t("manageChatSettings")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid max-w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[220px]">
                <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                  <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.24em]">
                    {t("membersTab")}
                  </div>
                  <div className="text-foreground mt-1 text-lg font-semibold">
                    {members.length}
                  </div>
                </div>
                {isGroup && (
                  <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                    <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.24em]">
                      {t("rolesTab")}
                    </div>
                    <div className="text-foreground mt-1 text-lg font-semibold">
                      {roles.length}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isDM ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="overflow-hidden rounded-[28px] border-border/60 bg-card/70 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="text-primary size-4" />
                  <h2 className="text-foreground text-lg font-semibold">
                    {t("membersTab")}
                  </h2>
                </div>

                <div className="mt-5 space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-background/60 flex items-center gap-3 rounded-[22px] border border-border/60 px-4 py-3"
                    >
                      <EntityAvatar
                        avatarUrl={member.user.avatarUrl}
                        name={member.user.username}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground truncate text-sm font-semibold">
                          {member.user.username}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-destructive/20 bg-destructive/5 shadow-none">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h2 className="text-foreground text-lg font-semibold">
                    {tC("deleteChat")}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-6">
                    {t("deleteChatConfirm")}
                  </p>
                </div>

                <div className="mt-6">
                  <ConfirmModal
                    heading={tC("deleteChat")}
                    message={t("deleteChatConfirm")}
                    onConfirm={() => deleteChat({ variables: { chatId } })}
                  >
                    <Button
                      variant="destructive"
                      className="h-11 w-full rounded-2xl"
                    >
                      <Trash2 className="size-4" />
                      {tC("deleteChat")}
                    </Button>
                  </ConfirmModal>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="h-auto rounded-full border border-border/60 bg-card/70 p-1.5 shadow-sm backdrop-blur">
              <TabsTrigger
                value="chat"
                className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                {t("chatTab")}
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                {t("membersTab")}
              </TabsTrigger>
              {canAccessRoles && (
                <TabsTrigger
                  value="roles"
                  className="rounded-full px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  {t("rolesTab")}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <div className="space-y-6">
                {(canChangeChatAvatar ||
                  canChangeChatInfo ||
                  canChangeChatName) && (
                  <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
                    {canChangeChatAvatar && (
                      <ChangeChatAvatarForm chatId={chatId} />
                    )}
                    {(canChangeChatInfo || canChangeChatName) && (
                      <ChangeChatInfoForm
                        chatId={chatId}
                        canChangeChatInfo={canChangeChatInfo}
                        canChangeChatName={canChangeChatName}
                      />
                    )}
                  </div>
                )}

                <Card className="rounded-[28px] border-border/60 bg-card/70 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-5 sm:flex-row">
                    {canDeleteChat && (
                      <ConfirmModal
                        heading={tC("deleteChat")}
                        message={t("deleteChatConfirm")}
                        onConfirm={() => deleteChat({ variables: { chatId } })}
                      >
                        <Button
                          variant="destructive"
                          className="h-11 rounded-2xl px-5"
                        >
                          <Trash2 className="size-4" />
                          {tC("deleteChat")}
                        </Button>
                      </ConfirmModal>
                    )}

                    {canLeaveChat && (
                      <ConfirmModal
                        heading={tC("leaveChat")}
                        message={tC("leaveChatConfirm")}
                        onConfirm={() => leaveChat({ variables: { chatId } })}
                      >
                        <Button
                          variant="outline"
                          className="text-destructive h-11 rounded-2xl px-5"
                        >
                          <LogOut className="size-4" />
                          {tC("leaveChat")}
                        </Button>
                      </ConfirmModal>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <ChatMembersSection
                chatId={chatId}
                groupId={groupId}
                members={members}
                roles={roles}
                userRoles={userRoles}
                isCreator={isCreator}
                canManageMembers={canManageMembers}
                canInviteMembers={canInviteMembers}
                canManageRoles={canManageRoles}
                currentUserId={user?.id ?? ""}
                onInviteMember={handleInviteMember}
                onRemoveMember={handleRemoveMember}
                onAssignRole={handleAssignRole}
                getRoleForUser={getRoleForUser}
                getMembersWithRole={getMembersWithRole}
              />
            </TabsContent>

            {canAccessRoles && (
              <TabsContent value="roles" className="mt-6">
                <ChatRolesSection
                  roles={roles}
                  canCreateRoles={canCreateRoles}
                  canDeleteRoles={canDeleteRoles}
                  canChangeRoleInfo={canChangeRoleInfo}
                  onCreateRole={handleCreateRole}
                  onDeleteRole={handleDeleteRole}
                  onTogglePermission={handleTogglePermission}
                  getMembersWithRole={getMembersWithRole}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ChatSettings;
