"use client";

import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Crown, Trash2, UserPlus, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/common/Card";
import { Button } from "@/components/ui/common/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/common/Dialog";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";

import {
  useFindAllUsersQuery,
  type GetChatRolesQuery,
  type FindChatByChatIdQuery,
} from "@/shared/graphql/generated/output";

type ChatRoleData = GetChatRolesQuery["getChatRoles"][0];
type Member = FindChatByChatIdQuery["findChatByChatId"]["members"][0];

interface ChatMembersSectionProps {
  chatId: string;
  members: Member[];
  roles: ChatRoleData[];
  userRoles: Record<string, string>;
  isCreator: boolean;
  canManageMembers: boolean;
  canInviteMembers: boolean;
  canManageRoles: boolean;
  currentUserId: string;
  onInviteMember: (targetUserId: string) => Promise<void>;
  onRemoveMember: (targetUserId: string) => Promise<void>;
  onAssignRole: (memberId: string, roleId: string) => Promise<void>;
  getRoleForUser: (userId: string) => ChatRoleData | undefined;
  getMembersWithRole: (roleId: string) => Member[];
}

const ChatMembersSection: FC<ChatMembersSectionProps> = ({
  chatId,
  members,
  roles,
  userRoles,
  isCreator,
  canManageMembers,
  canInviteMembers,
  canManageRoles,
  currentUserId,
  onInviteMember,
  onRemoveMember,
  onAssignRole,
  getRoleForUser,
}) => {
  const t = useTranslations("settings");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState<string | null>(null);

  const { data: usersData } = useFindAllUsersQuery({ skip: !inviteOpen });
  const existingIds = new Set(members.map(m => m.user.id));
  const invitableUsers = (usersData?.findAllUsers ?? []).filter(
    u => !existingIds.has(u.id),
  );

  // Group members by role
  const grouped = useMemo(() => {
    const sortedRoles = [...roles].sort(
      (a, b) => b.permissions.length - a.permissions.length,
    );
    const groups: { role: ChatRoleData; members: Member[] }[] = [];
    const assignedIds = new Set<string>();

    for (const role of sortedRoles) {
      const roleMembers = members.filter(m => {
        const ur = getRoleForUser(m.user.id);
        return ur?.id === role.id;
      });
      if (roleMembers.length > 0) {
        groups.push({ role, members: roleMembers });
        roleMembers.forEach(m => assignedIds.add(m.user.id));
      }
    }

    const unassigned = members.filter(m => !assignedIds.has(m.user.id));
    return { groups, unassigned };
  }, [members, roles, getRoleForUser]);

  const MemberRow = ({ member }: { member: Member }) => {
    const role = getRoleForUser(member.user.id);
    return (
      <Card className="mb-1">
        <CardContent className="flex items-center gap-3 p-3">
          <EntityAvatar
            name={member.user.username}
            avatarUrl={member.user.avatarUrl}
          />
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">
                {member.user.username}
              </span>
              {member.isCreator && (
                <Crown className="size-3.5 text-yellow-500" />
              )}
              {role && (
                <span
                  className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: role.color + "22",
                    color: role.color,
                  }}
                >
                  {role.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {canManageRoles && !member.isCreator && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setAssignUserId(member.user.id)}
              >
                {t("assignRole")}
              </Button>
            )}
            {canManageMembers &&
              !member.isCreator &&
              member.user.id !== currentUserId && (
                <ConfirmModal
                  heading={t("removeMember")}
                  message={t("removeMemberFromChat", {
                    username: member.user.username,
                  })}
                  onConfirm={() => onRemoveMember(member.user.id)}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </ConfirmModal>
              )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4" />
          {t("membersTab")} — {members.length}
        </div>
        {canInviteMembers && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <UserPlus className="size-4" />
                {t("invite")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inviteMember")}</DialogTitle>
              </DialogHeader>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {invitableUsers.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    {t("noUsersToInvite")}
                  </p>
                ) : (
                  invitableUsers.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/50"
                    >
                      <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                      <span className="flex-1 text-sm">{u.username}</span>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await onInviteMember(u.id);
                          setInviteOpen(false);
                        }}
                      >
                        {t("invite")}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Members grouped by role */}
      {grouped.groups.map(({ role, members: roleMembers }) => (
        <div key={role.id}>
          <div className="mb-1 flex items-center gap-2">
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: role.color }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: role.color }}
            >
              {role.name} — {roleMembers.length}
            </span>
          </div>
          {roleMembers.map(m => (
            <MemberRow key={m.user.id} member={m} />
          ))}
        </div>
      ))}

      {/* Unassigned members */}
      {grouped.unassigned.length > 0 && (
        <div>
          {grouped.groups.length > 0 && (
            <span className="text-muted-foreground mb-1 block text-xs font-semibold uppercase tracking-wider">
              {t("noRole")} — {grouped.unassigned.length}
            </span>
          )}
          {grouped.unassigned.map(m => (
            <MemberRow key={m.user.id} member={m} />
          ))}
        </div>
      )}

      {/* Assign Role Dialog */}
      <Dialog
        open={!!assignUserId}
        onOpenChange={open => !open && setAssignUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("assignRoleTo", {
                username: members.find(m => m.user.id === assignUserId)?.user
                  .username,
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {/* No role option */}
            <button
              onClick={() => {
                if (assignUserId) {
                  onAssignRole(assignUserId, "");
                  setAssignUserId(null);
                }
              }}
              className={`hover:bg-accent/50 flex w-full items-center gap-3 rounded-md p-3 text-left ${
                assignUserId && !userRoles[assignUserId]
                  ? "bg-accent/30 border-primary border"
                  : ""
              }`}
            >
              <div className="bg-muted size-3 rounded-full" />
              <span className="text-muted-foreground text-sm">
                {t("noRole")}
              </span>
            </button>
            {roles.map(role => {
              const isSelected =
                assignUserId && userRoles[assignUserId] === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    if (assignUserId) {
                      onAssignRole(assignUserId, role.id);
                      setAssignUserId(null);
                    }
                  }}
                  className={`hover:bg-accent/50 flex w-full items-center gap-3 rounded-md p-3 text-left ${
                    isSelected ? "bg-accent/30 border-primary border" : ""
                  }`}
                >
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{role.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {role.permissions.length} {t("permissionsCount")}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-primary text-sm">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatMembersSection;
