"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { LogOut, Trash2 } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import { Button } from "@/components/ui/common/Button";
import Heading from "@/components/ui/elements/Heading";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";

import ChangeChatAvatarForm from "./ChangeChatAvatarForm";
import ChangeChatInfoForm from "./ChangeChatInfoForm";
import ChatRolesSection from "./ChatRolesSection";
import ChatMembersSection from "./ChatMembersSection";

import { useCurrentChat } from "@/shared/hooks/useCurrentChat";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  ChatPermissionEnum,
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
  const { user } = useCurrentUser();
  const { chat, isLoadingChat, refetch: refetchChat } = useCurrentChat(chatId);

  const isGroup = !!chat?.isGroup;
  const isDM = !isGroup;
  const members = chat?.members ?? [];

  // ── Role queries ──
  const { data: roleData, loading: isLoadingMemberRole } =
    useGetMemberChatRoleQuery({
      variables: { chatId },
      skip: !isGroup,
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

  // ── Permissions ──
  const currentRole = roleData?.getMemberChatRole;
  const isCreator = isDM || !!currentRole?.isCreator;
  const perms = (currentRole?.permissions ?? []) as ChatPermissionEnum[];

  const canChangeChatInfo =
    isDM || isCreator || perms.includes(ChatPermissionEnum.ChangeChatInfo);
  const canChangeChatName =
    isDM || isCreator || perms.includes(ChatPermissionEnum.ChangeChatName);
  const canChangeChatAvatar =
    isDM || isCreator || perms.includes(ChatPermissionEnum.ChangeChatAvatar);
  const canManageMembers =
    isCreator || perms.includes(ChatPermissionEnum.RemoveMembers);
  const canManageRoles =
    isCreator || perms.includes(ChatPermissionEnum.ManageRoles);
  const canCreateRoles =
    isCreator || perms.includes(ChatPermissionEnum.CreateRoles);
  const canDeleteRoles =
    isCreator || perms.includes(ChatPermissionEnum.DeleteRoles);
  const canChangeRoleInfo =
    isCreator || perms.includes(ChatPermissionEnum.ChangeRoleInfo);
  const canInviteMembers =
    isDM || isCreator || perms.includes(ChatPermissionEnum.InviteMembers);

  // ── Subscriptions ──
  useChatUpsertedRoleSubscription({
    variables: { chatId },
    skip: !isGroup,
    onData: ({ data: subData }) => {
      const upserted = subData.data?.chatUpsertedRole;
      if (!upserted) return;
      setRoles(prev => {
        const idx = prev.findIndex(r => r.id === upserted.id);
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
      setRoles(prev => prev.filter(r => r.id !== deleted.id));
      setUserRoles(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(uid => {
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

  // ── Mutations ──
  const [upsertChatRole] = useUpsertChatRoleMutation();
  const [deleteChatRole] = useDeleteChatRoleMutation();
  const [assignChatRole] = useAssignRoleToUserMutation();
  const [removeChatRole] = useRemoveRoleFromUserMutation();
  const [inviteMember] = useInviteMemberToChatMutation();
  const [removeMember] = useRemoveMemberFromChatMutation();

  const [deleteChat] = useDeleteChatMutation({
    onCompleted() {
      toast.success(t("chatDeleted"));
      router.push(`/group/${groupId}`);
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

  // ── Handlers ──
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
      ? role.permissions.filter(p => p !== permKey)
      : [...role.permissions, permKey];

    await upsertChatRole({
      variables: {
        chatId,
        data: { name: role.name, color: role.color, permissions: newPerms },
      },
    });
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
      setUserRoles(prev => ({ ...prev, [memberId]: roleId }));
    } else {
      setUserRoles(prev => {
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
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    try {
      await removeMember({ variables: { chatId, targetUserId } });
      refetchChat();
      toast.success(t("memberRemoved"));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getRoleForUser = (userId: string): ChatRoleData | undefined => {
    const roleId = userRoles[userId];
    return roleId ? roles.find(r => r.id === roleId) : undefined;
  };

  const getMembersWithRole = (roleId: string) =>
    members.filter(m => userRoles[m.user.id] === roleId);

  if (isLoadingChat || isLoadingMemberRole) {
    return (
      <div className="flex h-full flex-1 justify-center overflow-y-auto">
        <div className="w-full max-w-3xl px-6 py-8 lg:px-12">
          <Heading
            title={t("chatSettingsTitle")}
            description={t("loadingSettings")}
            size="lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 justify-center overflow-y-auto">
      <div className="w-full max-w-3xl px-6 py-8 lg:px-12">
        <Heading
          title={t("chatSettingsTitle")}
          description={t("manageChatSettings")}
          size="lg"
        />
        <Tabs defaultValue="chat" className="mt-6 w-full">
          <TabsList>
            <TabsTrigger value="chat">{t("chatTab")}</TabsTrigger>
            {isGroup && (
              <TabsTrigger value="members">{t("membersTab")}</TabsTrigger>
            )}
            {isGroup && canManageRoles && (
              <TabsTrigger value="roles">{t("rolesTab")}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="chat">
            <div className="mt-6 space-y-8">
              {canChangeChatAvatar && <ChangeChatAvatarForm chatId={chatId} />}
              {(canChangeChatInfo || canChangeChatName) && (
                <ChangeChatInfoForm chatId={chatId} />
              )}

              <div className="space-y-3 flex justify-center border-t py-6">
                {(isCreator || isDM) && (
                  <ConfirmModal
                    heading={tC("deleteChat")}
                    message={t("deleteChatConfirm")}
                    onConfirm={() => deleteChat({ variables: { chatId } })}
                  >
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="size-4" />
                      {tC("deleteChat")}
                    </Button>
                  </ConfirmModal>
                )}
                {isGroup && !isCreator && (
                  <ConfirmModal
                    heading={tC("leaveChat")}
                    message={tC("leaveChatConfirm")}
                    onConfirm={() => leaveChat({ variables: { chatId } })}
                  >
                    <Button
                      variant="outline"
                      className="text-destructive gap-2"
                    >
                      <LogOut className="size-4" />
                      {tC("leaveChat")}
                    </Button>
                  </ConfirmModal>
                )}
              </div>
            </div>
          </TabsContent>

          {isGroup && (
            <TabsContent value="members">
              <ChatMembersSection
                chatId={chatId}
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
          )}

          {isGroup && canManageRoles && (
            <TabsContent value="roles">
              <ChatRolesSection
                roles={roles}
                canCreateRoles={canCreateRoles}
                canManageRoles={canManageRoles}
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
      </div>
    </div>
  );
};

export default ChatSettings;
