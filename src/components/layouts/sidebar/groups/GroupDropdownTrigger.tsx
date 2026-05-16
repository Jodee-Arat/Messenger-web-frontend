import { useTranslations } from "next-intl";

import {
  FindAllGroupsByUserQuery,
  GroupPermissionEnum,
  useGetMemberRoleQuery,
} from "@/shared/graphql/generated/output";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";

import GroupsSidebarItem from "./GroupsSidebarItem";

interface GroupDropdownTriggerProps {
  group: FindAllGroupsByUserQuery["findAllGroupsByUser"][0];
  deleteGroup: (groupId: string) => void;
  variant?: "icon" | "row";
  onNavigate?: () => void;
}

const GroupDropdownTrigger = ({
  group,
  deleteGroup,
  variant = "icon",
  onNavigate,
}: GroupDropdownTriggerProps) => {
  const t = useTranslations("groups");
  const { data: roleData } = useGetMemberRoleQuery({
    variables: { groupId: group.id },
  });

  const currentRole = roleData?.getMemberRole;
  const canDeleteGroup =
    !!currentRole?.isCreator ||
    (currentRole?.permissions ?? []).includes(GroupPermissionEnum.DeleteGroup);

  if (!canDeleteGroup) {
    return (
      <GroupsSidebarItem
        group={group}
        variant={variant}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <GroupsSidebarItem
          group={group}
          variant={variant}
          onNavigate={onNavigate}
        />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[230px]">
        <ContextMenuItem
          className="text-destructive"
          onClick={() => deleteGroup(group.id)}
        >
          {t("deleteGroup")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default GroupDropdownTrigger;
