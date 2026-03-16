"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useUser } from "./useUser";

import {
  GetFriendsQuery,
  GetIncomingFriendRequestsQuery,
  GetOutgoingFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useFriendRemovedSubscription,
  useFriendRequestAcceptedSubscription,
  useFriendRequestCancelledSubscription,
  useFriendRequestDeclinedSubscription,
  useFriendRequestSentSubscription,
  useGetFriendsQuery,
  useGetIncomingFriendRequestsQuery,
  useGetOutgoingFriendRequestsQuery,
  useRemoveFriendMutation,
  useSendFriendRequestByUsernameMutation,
} from "@/shared/graphql/generated/output";

type Friend = GetFriendsQuery["getFriends"][0];
type IncomingRequest =
  GetIncomingFriendRequestsQuery["getIncomingFriendRequests"][0];
type OutgoingRequest =
  GetOutgoingFriendRequestsQuery["getOutgoingFriendRequests"][0];

export function useFriends() {
  const { userId } = useUser();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([]);

  // ── Queries ──
  const { data: friendsData, loading: isLoadingFriends } = useGetFriendsQuery({
    fetchPolicy: "cache-and-network",
  });
  const { data: incomingData, loading: isLoadingIncoming } =
    useGetIncomingFriendRequestsQuery({ fetchPolicy: "cache-and-network" });
  const { data: outgoingData, loading: isLoadingOutgoing } =
    useGetOutgoingFriendRequestsQuery({ fetchPolicy: "cache-and-network" });

  useEffect(() => {
    if (friendsData?.getFriends) setFriends(friendsData.getFriends);
  }, [friendsData]);

  useEffect(() => {
    if (incomingData?.getIncomingFriendRequests)
      setIncoming(incomingData.getIncomingFriendRequests);
  }, [incomingData]);

  useEffect(() => {
    if (outgoingData?.getOutgoingFriendRequests)
      setOutgoing(outgoingData.getOutgoingFriendRequests);
  }, [outgoingData]);

  // ── Subscriptions ──
  const { data: sentData } = useFriendRequestSentSubscription({
    variables: { userId },
    skip: !userId,
  });
  const { data: acceptedData } = useFriendRequestAcceptedSubscription({
    variables: { userId },
    skip: !userId,
  });
  const { data: declinedData } = useFriendRequestDeclinedSubscription({
    variables: { userId },
    skip: !userId,
  });
  const { data: cancelledData } = useFriendRequestCancelledSubscription({
    variables: { userId },
    skip: !userId,
  });
  const { data: removedData } = useFriendRemovedSubscription({
    variables: { userId },
    skip: !userId,
  });

  useEffect(() => {
    if (!sentData?.friendRequestSent) return;
    const req = sentData.friendRequestSent;
    if (req.userId === userId) {
      setOutgoing(prev =>
        prev.some(r => r.id === req.id)
          ? prev
          : [req as OutgoingRequest, ...prev],
      );
    } else {
      setIncoming(prev =>
        prev.some(r => r.id === req.id)
          ? prev
          : [req as IncomingRequest, ...prev],
      );
    }
  }, [sentData, userId]);

  useEffect(() => {
    if (!acceptedData?.friendRequestAccepted) return;
    const accepted = acceptedData.friendRequestAccepted;
    setIncoming(prev => prev.filter(r => r.id !== accepted.id));
    setOutgoing(prev => prev.filter(r => r.id !== accepted.id));
    setFriends(prev =>
      prev.some(f => f.id === accepted.id)
        ? prev
        : [accepted as Friend, ...prev],
    );
  }, [acceptedData]);

  useEffect(() => {
    if (!declinedData?.friendRequestDeclined) return;
    const declined = declinedData.friendRequestDeclined;
    setOutgoing(prev => prev.filter(r => r.id !== declined.id));
    setIncoming(prev => prev.filter(r => r.id !== declined.id));
  }, [declinedData]);

  useEffect(() => {
    if (!cancelledData?.friendRequestCancelled) return;
    const cancelled = cancelledData.friendRequestCancelled;
    setOutgoing(prev => prev.filter(r => r.id !== cancelled.id));
    setIncoming(prev => prev.filter(r => r.id !== cancelled.id));
  }, [cancelledData]);

  useEffect(() => {
    if (!removedData?.friendRemoved) return;
    const removed = removedData.friendRemoved;
    setFriends(prev => prev.filter(f => f.id !== removed.id));
  }, [removedData]);

  // ── Mutations ──
  const [sendRequest, { loading: isSending }] =
    useSendFriendRequestByUsernameMutation({
      refetchQueries: ["GetOutgoingFriendRequests"],
    });
  const [acceptRequest] = useAcceptFriendRequestMutation({
    refetchQueries: ["GetFriends", "GetIncomingFriendRequests"],
  });
  const [declineRequest] = useDeclineFriendRequestMutation({
    refetchQueries: ["GetIncomingFriendRequests"],
  });
  const [cancelRequest] = useCancelFriendRequestMutation({
    refetchQueries: ["GetOutgoingFriendRequests"],
  });
  const [removeFriendMut] = useRemoveFriendMutation({
    refetchQueries: ["GetFriends"],
  });

  const handleSendRequest = useCallback(
    async (username: string) => {
      if (!username.trim()) return;
      try {
        await sendRequest({ variables: { username: username.trim() } });
        toast.success("Friend request sent!");
      } catch (e: any) {
        toast.error(e.message ?? "Failed to send friend request");
      }
    },
    [sendRequest],
  );

  const handleAccept = useCallback(
    async (id: string) => {
      try {
        await acceptRequest({ variables: { friendshipId: id } });
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [acceptRequest],
  );

  const handleDecline = useCallback(
    async (id: string) => {
      try {
        await declineRequest({ variables: { friendshipId: id } });
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [declineRequest],
  );

  const handleCancel = useCallback(
    async (id: string) => {
      try {
        await cancelRequest({ variables: { friendshipId: id } });
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [cancelRequest],
  );

  const handleRemoveFriend = useCallback(
    async (id: string) => {
      try {
        await removeFriendMut({ variables: { friendshipId: id } });
        toast.success("Friend removed");
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [removeFriendMut],
  );

  const getFriendUser = (f: Friend) =>
    f.user?.id === userId ? f.friend : f.user;

  return {
    friends,
    incoming,
    outgoing,
    isLoadingFriends,
    isLoadingIncoming,
    isLoadingOutgoing,
    isSending,
    handleSendRequest,
    handleAccept,
    handleDecline,
    handleCancel,
    handleRemoveFriend,
    getFriendUser,
  };
}
