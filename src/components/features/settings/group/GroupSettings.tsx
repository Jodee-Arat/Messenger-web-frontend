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

import ChangeGroupAvatarForm from "./ChangeGroupAvatarForm";
import ChangeGroupInfoForm from "./ChangeGroupInfoForm";
import GroupMembersSection from "./GroupMembersSection";
import GroupRolesSection from "./GroupRolesSection";

import { useCurrentGroup } from "@/shared/hooks/useCurrentGroup";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import {
  GroupPermissionEnum,
  useGetGroupRolesQuery,
  useGetMemberRoleQuery,
  useDeleteGroupMutation,
  useGroupUpsertedRoleSubscription,
  useGroupDeletedRoleSubscription,
  useGroupAssignedRoleSubscription,
  useGroupRemovedRoleSubscription,
  useUpsertGroupRoleMutation,
  useDeleteGroupRoleMutation,
  useAssignGroupRoleToMemberMutation,
  useRemoveGroupRoleFromMemberMutation,
  useInviteMemberToGroupMutation,
  useRemoveMemberFromGroupMutation,
  type GetGroupRolesQuery,
} from "@/shared/graphql/generated/output";

type GroupRoleData = GetGroupRolesQuery["getGroupRoles"][0];

const GroupSettings = () => {
  const t = useTranslations("settings");
  const tG = useTranslations("groups");
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const router = useRouter();
  const { user } = useCurrentUser();
  const {
    group,
    isLoadingGroup,
    refetch: refetchGroup,
  } = useCurrentGroup(groupId);

  const members = group?.members ?? [];

  // ── Role queries ──
  const { data: roleData, loading: isLoadingMemberRole } =
    useGetMemberRoleQuery({
      variables: { groupId },
    });

  const { data: rolesData, refetch: refetchRoles } = useGetGroupRolesQuery({
    variables: { groupId },
    fetchPolicy: "network-only",
  });

  const [roles, setRoles] = useState<GroupRoleData[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rolesData?.getGroupRoles) setRoles(rolesData.getGroupRoles);
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
  const currentRole = roleData?.getMemberRole;
  const isCreator = !!currentRole?.isCreator;
  const perms = (currentRole?.permissions ?? []) as GroupPermissionEnum[];

  const canChangeGroupInfo =
    isCreator || perms.includes(GroupPermissionEnum.ChangeGroupInfo);
  const canManageRoles =
    isCreator || perms.includes(GroupPermissionEnum.ManageRoles);
  const canCreateRoles =
    isCreator || perms.includes(GroupPermissionEnum.CreateRoles);
  const canDeleteRoles =
    isCreator || perms.includes(GroupPermissionEnum.DeleteRoles);
  const canChangeRoleInfo =
    isCreator || perms.includes(GroupPermissionEnum.ChangeRoleInfo);
  const canInviteMembers =
    isCreator || perms.includes(GroupPermissionEnum.InviteMembers);
  const canRemoveMembers =
    isCreator || perms.includes(GroupPermissionEnum.RemoveMembers);
  const canDeleteGroup =
    isCreator || perms.includes(GroupPermissionEnum.DeleteGroup);

  // ── Subscriptions ──
  useGroupUpsertedRoleSubscription({
    variables: { groupId },
    onData: ({ data: subData }) => {
      const upserted = subData.data?.groupUpsertedRole;
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

  useGroupDeletedRoleSubscription({
    variables: { groupId },
    onData: ({ data: subData }) => {
      const deleted = subData.data?.groupDeletedRole;
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

  useGroupAssignedRoleSubscription({
    variables: { groupId },
    onData: () => {
      refetchRoles();
      refetchGroup();
    },
  });

  useGroupRemovedRoleSubscription({
    variables: { groupId },
    onData: () => {
      refetchRoles();
      refetchGroup();
    },
  });

  // ── Mutations ──
  const [upsertGroupRole] = useUpsertGroupRoleMutation();
  const [deleteGroupRole] = useDeleteGroupRoleMutation();
  const [assignGroupRole] = useAssignGroupRoleToMemberMutation();
  const [removeGroupRole] = useRemoveGroupRoleFromMemberMutation();
  const [inviteMember] = useInviteMemberToGroupMutation();
  const [removeMember] = useRemoveMemberFromGroupMutation();

  const [deleteGroup] = useDeleteGroupMutation({
    onCompleted() {
      toast.success(t("groupDeleted"));
      router.push("/");
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  // ── Handlers ──
  const handleCreateRole = async (
    name: string,
    color: string,
    permissions: GroupPermissionEnum[],
  ) => {
    await upsertGroupRole({
      variables: { groupId, data: { name, color, permissions } },
    });
  };

  const handleDeleteRole = async (roleId: string) => {
    await deleteGroupRole({ variables: { groupId, roleId } });
  };

  const handleTogglePermission = async (
    role: GroupRoleData,
    permKey: GroupPermissionEnum,
  ) => {
    const has = role.permissions.includes(permKey);
    const newPerms = has
      ? role.permissions.filter(p => p !== permKey)
      : [...role.permissions, permKey];

    await upsertGroupRole({
      variables: {
        groupId,
        data: { name: role.name, color: role.color, permissions: newPerms },
      },
    });

    // Optimistically update local roles state
    setRoles(prev =>
      prev.map(r => (r.id === role.id ? { ...r, permissions: newPerms } : r)),
    );
  };

  const handleAssignRole = async (memberId: string, roleId: string) => {
    const currentRoleId = userRoles[memberId];
    if (currentRoleId) {
      await removeGroupRole({
        variables: { groupId, roleId: currentRoleId, memberId },
      });
    }
    if (roleId && roleId !== currentRoleId) {
      await assignGroupRole({ variables: { groupId, roleId, memberId } });
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
      await inviteMember({
        variables: { groupId, targetUserId },
        refetchQueries: ["FindGroupByGroupId"],
      });
      toast.success(t("memberInvited"));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    try {
      await removeMember({
        variables: { groupId, targetUserId },
        refetchQueries: ["FindGroupByGroupId"],
      });
      toast.success(t("memberRemoved"));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const getRoleForUser = (userId: string): GroupRoleData | undefined => {
    const roleId = userRoles[userId];
    return roleId ? roles.find(r => r.id === roleId) : undefined;
  };

  const getMembersWithRole = (roleId: string) =>
    members.filter(m => userRoles[m.user.id] === roleId);

  if (isLoadingGroup || isLoadingMemberRole) {
    return (
      <div className="flex h-full flex-1 justify-center overflow-y-auto">
        <div className="w-full max-w-3xl px-6 py-8 lg:px-12">
          <Heading
            title={t("groupSettingsTitle")}
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
          title={t("groupSettingsTitle")}
          description={t("manageGroupSettings")}
          size="lg"
        />
        <Tabs defaultValue="group" className="mt-6 w-full">
          <TabsList>
            <TabsTrigger value="group">{t("info")}</TabsTrigger>
            <TabsTrigger value="members">{t("membersTab")}</TabsTrigger>
            {canManageRoles && (
              <TabsTrigger value="roles">{t("rolesTab")}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="group">
            <div className="mt-6 space-y-8">
              {canChangeGroupInfo && (
                <>
                  <ChangeGroupAvatarForm groupId={groupId} />
                  <ChangeGroupInfoForm groupId={groupId} />
                </>
              )}

              <div className="space-y-3 flex justify-center border-t pt-6">
                {canDeleteGroup && (
                  <ConfirmModal
                    heading={tG("deleteGroup")}
                    message={t("deleteGroupConfirm")}
                    onConfirm={() => deleteGroup({ variables: { groupId } })}
                  >
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="size-4" />
                      {tG("deleteGroup")}
                    </Button>
                  </ConfirmModal>
                )}
                {!isCreator && (
                  <p className="text-muted-foreground text-xs">
                    {t("onlyCreatorCanDelete")}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <GroupMembersSection
              groupId={groupId}
              members={members}
              roles={roles}
              userRoles={userRoles}
              isCreator={isCreator}
              canManageRoles={canManageRoles}
              canInviteMembers={canInviteMembers}
              canRemoveMembers={canRemoveMembers}
              currentUserId={user?.id ?? ""}
              onInviteMember={handleInviteMember}
              onRemoveMember={handleRemoveMember}
              onAssignRole={handleAssignRole}
              getRoleForUser={getRoleForUser}
              getMembersWithRole={getMembersWithRole}
            />
          </TabsContent>

          {canManageRoles && (
            <TabsContent value="roles">
              <GroupRolesSection
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

export default GroupSettings;
