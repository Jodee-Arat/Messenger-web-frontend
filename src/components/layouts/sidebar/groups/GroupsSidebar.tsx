"use client";

import {
  FindAllGroupsByUserQuery,
  useDeleteGroupMutation,
  useFindAllGroupsByUserQuery,
  useGroupAddedSubscription,
  useGroupDeletedSubscription,
} from "@/shared/graphql/generated/output";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { cn } from "@/shared/utils/tw-merge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import BrandMark from "@/components/ui/elements/BrandMark";

import CreateGroupModal from "./CreateGroupModal";
import GroupDropdownTrigger from "./GroupDropdownTrigger";

const GroupsSidebar = () => {
  const [allGroups, setAllGroups] = useState<
    FindAllGroupsByUserQuery["findAllGroupsByUser"]
  >([]);

  const { user } = useCurrentUser();
  const pathname = usePathname();
  const t = useTranslations("groups");

  const { data: allGroupsData, loading: isLoadingFindAllGroups } =
    useFindAllGroupsByUserQuery({
      variables: {
        filters: {},
      },
      skip: !user?.id,
    });

  const { data: newGroupData } = useGroupAddedSubscription({
    variables: { userId: user?.id ?? "" },
    skip: !user?.id,
  });

  const [deleteGroup, { loading: isLoadingDeleteGroup }] =
    useDeleteGroupMutation({
      onCompleted() {
        toast.success(t("groupDeleted"));
      },
      onError() {
        toast.error(t("deleteError"));
      },
    });

  const { data: deleteGroupData } = useGroupDeletedSubscription({
    variables: {
      userId: user?.id ?? "",
    },
  });

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup({
      variables: {
        groupId,
      },
    });
  };

  useEffect(() => {
    if (!allGroupsData || !allGroupsData.findAllGroupsByUser) return;

    setAllGroups(allGroupsData.findAllGroupsByUser || []);
  }, [allGroupsData]);

  useEffect(() => {
    if (!newGroupData || !newGroupData.groupAdded) return;

    setAllGroups((prevGroups) => [newGroupData.groupAdded, ...prevGroups]);
  }, [newGroupData]);

  useEffect(() => {
    if (!deleteGroupData || !deleteGroupData.groupDeleted) {
      return;
    }

    setAllGroups((prevGroups) =>
      prevGroups.filter(
        (group) => group.id !== deleteGroupData.groupDeleted.id,
      ),
    );
  }, [deleteGroupData]);

  return (
    <aside className="flex h-full w-[72px] flex-shrink-0 flex-col items-center border-r border-border bg-background py-3">
      {/* Home button - like Discord's DM icon */}
      <Link
        href="/"
        className={cn(
          "mb-2 flex size-12 items-center justify-center rounded-2xl transition-all hover:rounded-xl",
          pathname === "/" || pathname === "/friends" || pathname === "/dm"
            ? "bg-primary text-primary-foreground rounded-xl"
            : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground",
        )}
      >
        <BrandMark
          className="size-7 rounded-none bg-transparent ring-0 shadow-none"
          imageClassName="p-0"
        />
      </Link>

      {/* Separator */}
      <div className="bg-border mx-auto mb-2 h-0.5 w-8 rounded-full" />

      {/* Group list */}
      {user?.id ? (
        <div className="scrollbar-thin scrollbar-transparent flex flex-1 flex-col items-center space-y-2 overflow-y-auto overflow-x-hidden">
          {allGroups.map((group, index) => (
            <GroupDropdownTrigger
              key={index}
              group={group}
              deleteGroup={handleDeleteGroup}
            />
          ))}
          <CreateGroupModal />
        </div>
      ) : null}
    </aside>
  );
};

export default GroupsSidebar;
