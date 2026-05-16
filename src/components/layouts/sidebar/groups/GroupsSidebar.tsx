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

    setAllGroups((prevGroups) => {
      const existingIndex = prevGroups.findIndex(
        (group) => group.id === newGroupData.groupAdded.id,
      );

      if (existingIndex === -1) {
        return [newGroupData.groupAdded, ...prevGroups];
      }

      return prevGroups.map((group) =>
        group.id === newGroupData.groupAdded.id
          ? newGroupData.groupAdded
          : group,
      );
    });
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
    <aside className="order-last flex h-[calc(4rem+env(safe-area-inset-bottom))] w-full flex-shrink-0 items-center border-t border-border bg-background px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:order-none md:h-full md:w-[72px] md:flex-col md:border-r md:border-t-0 md:px-0 md:py-3">
      {/* Home button - like Discord's DM icon */}
      <Link
        href="/"
        className={cn(
          "mr-2 flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all hover:rounded-xl md:mr-0 md:mb-2",
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
      <div className="bg-border mx-auto mb-2 hidden h-0.5 w-8 rounded-full md:block" />

      {/* Group list */}
      {user?.id ? (
        <div className="scrollbar-thin scrollbar-transparent flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden md:min-h-0 md:flex-col md:gap-0 md:space-y-2 md:overflow-x-hidden md:overflow-y-auto [&>*]:shrink-0">
          {allGroups.map((group) => (
            <GroupDropdownTrigger
              key={group.id}
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
