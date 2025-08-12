import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/common/ContextMenu";

import { FindAllGroupsByUserQuery } from "@/graphql/generated/output";

import GroupsSidebarItem from "./GroupsSidebarItem";

interface GroupDropdownTriggerProps {
  group: FindAllGroupsByUserQuery["findAllGroupsByUser"][0];
  deleteGroup: (groupId: string) => void;
}

const GroupDropdownTrigger = ({
  group,
  deleteGroup,
}: GroupDropdownTriggerProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <GroupsSidebarItem group={group} />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[230px]">
        <ContextMenuItem
          className="text-destructive"
          onClick={() => deleteGroup(group.id)}
        >
          Delete group
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default GroupDropdownTrigger;
