"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  FindAllGroupsByUserQuery,
  useDeleteGroupMutation,
  useFindAllGroupsByUserQuery,
  useGroupAddedSubscription,
  useGroupDeletedSubscription,
} from "@/graphql/generated/output";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import CreateGroupModal from "./CreateGroupModal";
import GroupDropdownTrigger from "./GroupDropdownTrigger";

const GroupsSidebar = () => {
  const [allGroups, setAllGroups] = useState<
    FindAllGroupsByUserQuery["findAllGroupsByUser"]
  >([]);

  const { user } = useCurrentUser();

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
        toast.success("Group deleted successfully.");
      },
      onError() {
        toast.error("Error deleting group.");
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
      prevGroups.filter((group) => group.id !== deleteGroupData.groupDeleted.id)
    );
  }, [deleteGroupData]);

  return (
    <>
      {user?.id ? (
        <div className="scrollbar-thin scrollbar-transparent fixed mt-[75px] flex max-h-[calc(100vh-100px)] w-[75px] flex-col items-center space-y-2 overflow-y-auto overflow-x-hidden py-2">
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
    </>
  );
};

export default GroupsSidebar;
