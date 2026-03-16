"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Crown, Plus, Shield, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/common/Card";
import { Button } from "@/components/ui/common/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/common/Dialog";
import { Input } from "@/components/ui/common/Input";
import { Checkbox } from "@/components/ui/common/Checkbox";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";

import {
  ChatPermissionEnum,
  type GetChatRolesQuery,
  type FindChatByChatIdQuery,
} from "@/shared/graphql/generated/output";

type ChatRoleData = GetChatRolesQuery["getChatRoles"][0];
type Member = FindChatByChatIdQuery["findChatByChatId"]["members"][0];

const CHAT_ROLE_COLORS = [
  "#5865f2",
  "#57f287",
  "#fee75c",
  "#eb459e",
  "#ed4245",
  "#ffffff",
  "#e67e22",
  "#9b59b6",
  "#1abc9c",
  "#e91e63",
  "#2ecc71",
  "#3498db",
];

const ALL_PERMISSIONS: {
  key: ChatPermissionEnum;
  label: string;
  description: string;
}[] = [
  {
    key: ChatPermissionEnum.SendMessages,
    label: "canSendMessages",
    description: "canSendMessagesDesc",
  },
  {
    key: ChatPermissionEnum.EditMessages,
    label: "canEditMessages",
    description: "canEditMessagesDesc",
  },
  {
    key: ChatPermissionEnum.DeleteMessages,
    label: "canDeleteMessages",
    description: "canDeleteMessagesDesc",
  },
  {
    key: ChatPermissionEnum.PinMessages,
    label: "canPinMessages",
    description: "canPinMessagesDesc",
  },
  {
    key: ChatPermissionEnum.InviteMembers,
    label: "canInviteMembers",
    description: "canInviteMembersDesc",
  },
  {
    key: ChatPermissionEnum.RemoveMembers,
    label: "canRemoveMembers",
    description: "canRemoveMembersDesc",
  },
  {
    key: ChatPermissionEnum.ManageRoles,
    label: "canManageRoles",
    description: "canManageRolesDesc",
  },
  {
    key: ChatPermissionEnum.CreateRoles,
    label: "canCreateRoles",
    description: "canCreateRolesDesc",
  },
  {
    key: ChatPermissionEnum.ChangeChatInfo,
    label: "canChangeChatInfo",
    description: "canChangeChatInfoDesc",
  },
  {
    key: ChatPermissionEnum.ChangeChatName,
    label: "canChangeChatName",
    description: "canChangeChatNameDesc",
  },
  {
    key: ChatPermissionEnum.ChangeChatAvatar,
    label: "canChangeChatAvatar",
    description: "canChangeChatAvatarDesc",
  },
  {
    key: ChatPermissionEnum.ChangeRoleInfo,
    label: "canChangeRoleInfo",
    description: "canChangeRoleInfoDesc",
  },
  {
    key: ChatPermissionEnum.DeleteRoles,
    label: "canDeleteRoles",
    description: "canDeleteRolesDesc",
  },
];

interface ChatRolesSectionProps {
  roles: ChatRoleData[];
  canCreateRoles: boolean;
  canManageRoles: boolean;
  canDeleteRoles: boolean;
  canChangeRoleInfo: boolean;
  onCreateRole: (
    name: string,
    color: string,
    permissions: ChatPermissionEnum[],
  ) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  onTogglePermission: (
    role: ChatRoleData,
    permKey: ChatPermissionEnum,
  ) => Promise<void>;
  getMembersWithRole: (roleId: string) => Member[];
}

const ChatRolesSection: FC<ChatRolesSectionProps> = ({
  roles,
  canCreateRoles,
  canManageRoles,
  canDeleteRoles,
  canChangeRoleInfo,
  onCreateRole,
  onDeleteRole,
  onTogglePermission,
  getMembersWithRole,
}) => {
  const t = useTranslations("settings");
  const tP = useTranslations("permissions");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ChatRoleData | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CHAT_ROLE_COLORS[0]);
  const [newPerms, setNewPerms] = useState<Set<ChatPermissionEnum>>(new Set());

  const resetCreateForm = () => {
    setNewName("");
    setNewColor(CHAT_ROLE_COLORS[0]);
    setNewPerms(new Set());
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreateRole(newName.trim(), newColor, Array.from(newPerms));
    resetCreateForm();
    setCreateOpen(false);
  };

  const toggleNewPerm = (key: ChatPermissionEnum) => {
    setNewPerms(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
          <Crown className="size-4 text-yellow-500" />
          {t("roles")} — {roles.length}
        </div>
      </div>

      {/* Roles list */}
      {roles.map(role => (
        <Card
          key={role.id}
          className="cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => setSelectedRole(role)}
        >
          <CardContent className="flex items-center gap-3 p-3">
            <div
              className="size-3.5 rounded-full"
              style={{ backgroundColor: role.color }}
            />
            <div className="flex-1">
              <span className="text-sm font-semibold">{role.name}</span>
              <span className="text-muted-foreground ml-2 text-xs">
                {role.permissions.length} of {ALL_PERMISSIONS.length}{" "}
                {t("permissionsCount")}
              </span>
            </div>
            <ChevronRight className="text-muted-foreground size-4" />
          </CardContent>
        </Card>
      ))}

      {/* Create role button */}
      {(canManageRoles || canCreateRoles) && (
        <button
          onClick={() => {
            resetCreateForm();
            setCreateOpen(true);
          }}
          className="border-primary text-primary flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-sm font-semibold transition-colors hover:bg-accent/50"
        >
          <Plus className="size-4" />
          {t("createRole")}
        </button>
      )}

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("createRole")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                {t("roleName")}
              </label>
              <Input
                placeholder={t("exampleRole")}
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="text-muted-foreground mb-2 block text-xs font-semibold uppercase">
                {t("roleColor")}
              </label>
              <div className="flex flex-wrap gap-2">
                {CHAT_ROLE_COLORS.map(color => (
                  <button
                    key={color}
                    className="size-8 rounded-full transition-all"
                    style={{
                      backgroundColor: color,
                      outline:
                        newColor === color
                          ? "2px solid var(--foreground)"
                          : "none",
                      outlineOffset: "2px",
                    }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="text-muted-foreground mb-2 block text-xs font-semibold uppercase">
                {t("permissions")}
              </label>
              <div className="space-y-2">
                {ALL_PERMISSIONS.map(perm => (
                  <label
                    key={perm.key}
                    className="flex items-start gap-3 rounded-md p-2 hover:bg-accent/30"
                  >
                    <Checkbox
                      checked={newPerms.has(perm.key)}
                      onCheckedChange={() => toggleNewPerm(perm.key)}
                    />
                    <div>
                      <span className="text-sm font-medium">
                        {tP(perm.label)}
                      </span>
                      <p className="text-muted-foreground text-xs">
                        {tP(perm.description)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              className="w-full gap-2"
              disabled={!newName.trim()}
              onClick={handleCreate}
            >
              <Shield className="size-4" />
              {t("createRole")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Detail Dialog */}
      <Dialog
        open={!!selectedRole}
        onOpenChange={open => !open && setSelectedRole(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          {selectedRole && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className="size-4 rounded-full"
                    style={{ backgroundColor: selectedRole.color }}
                  />
                  {selectedRole.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Permissions */}
                <div>
                  <label className="text-muted-foreground mb-2 block text-xs font-semibold uppercase">
                    {t("permissions")}
                  </label>
                  {ALL_PERMISSIONS.map(perm => {
                    const enabled = selectedRole.permissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        className="flex items-center justify-between border-b py-2.5 last:border-0"
                      >
                        <div>
                          <span className="text-sm font-medium">
                            {tP(perm.label)}
                          </span>
                        </div>
                        {canManageRoles || canChangeRoleInfo ? (
                          <button
                            onClick={() =>
                              onTogglePermission(selectedRole, perm.key)
                            }
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              enabled
                                ? "bg-green-500/20 text-green-500"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {enabled ? t("enabled") : t("disabled")}
                          </button>
                        ) : (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              enabled
                                ? "bg-green-500/20 text-green-500"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {enabled ? t("enabled") : t("disabled")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Members with role */}
                <div>
                  <label className="text-muted-foreground mb-2 block text-xs font-semibold uppercase">
                    {t("membersWithRole")} —{" "}
                    {getMembersWithRole(selectedRole.id).length}
                  </label>
                  {getMembersWithRole(selectedRole.id).length === 0 ? (
                    <p className="text-muted-foreground text-xs">
                      {t("noMembersWithRole")}
                    </p>
                  ) : (
                    getMembersWithRole(selectedRole.id).map(m => (
                      <div
                        key={m.user.id}
                        className="flex items-center gap-2 border-b py-2 last:border-0"
                      >
                        <EntityAvatar
                          name={m.user.username}
                          avatarUrl={m.user.avatarUrl}
                          size="sm"
                        />
                        <span className="text-sm">{m.user.username}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Delete role */}
                {(canManageRoles || canDeleteRoles) && (
                  <ConfirmModal
                    heading={t("deleteRole")}
                    message={t("deleteRoleConfirm", {
                      name: selectedRole.name,
                    })}
                    onConfirm={() => {
                      onDeleteRole(selectedRole.id);
                      setSelectedRole(null);
                    }}
                  >
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="size-4" />
                      {t("deleteRole")}
                    </Button>
                  </ConfirmModal>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatRolesSection;
