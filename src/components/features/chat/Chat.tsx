"use client";

import { useChat } from "@/shared/hooks/useChat";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useTypingIndicator } from "@/shared/hooks/useTypingIndicator";
import { LogOut, ShieldOff, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/common/Alert";
import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
import BackButton from "@/components/ui/elements/BackButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/common/Dialog";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";
import DragAndDropWrapper from "@/components/ui/elements/DragAndDropWrapper";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import {
  ChatPermissionEnum,
  useChatDeletedSubscription,
  useFindAllChatsByUserQuery,
  useFindGroupByGroupIdQuery,
  useGetMemberChatRoleQuery,
  useInviteMemberToChatMutation,
  useLeaveChatMutation,
} from "@/shared/graphql/generated/output";
import {
  getGraphQLErrorMessage,
  isDirectContactBlockedError,
} from "@/shared/utils/direct-contact-blocked";
import {
  getChatCollectionRoute,
  getChatRoute,
} from "@/shared/utils/chat-route";
import {
  getDirectChatDisplayAvatar,
  getDirectChatDisplayName,
} from "@/shared/utils/direct-chat";

import ChatMessageList from "./message/list/ChatMessageList";
import SendMessageForm from "./message/send/SendMessageForm";

interface ChatProp {
  chatId: string;
}

const Chat: FC<ChatProp> = ({ chatId }) => {
  const { user, isLoadingProfile } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const handledAccessLossRef = useRef(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [hasRuntimeBlockedDirectContact, setHasRuntimeBlockedDirectContact] =
    useState(false);
  const t = useTranslations("chats");
  const tSettings = useTranslations("settings");
  const tCommon = useTranslations("common");

  const handleDirectContactBlocked = useCallback(() => {
    setHasRuntimeBlockedDirectContact(true);
  }, []);

  const {
    files,
    isLoadingSendFile,
    handleDelete,
    handleClearMessageId,
    drop,
    forwardedMessages,
    setForwardedMessages,
    handleAddForwardedMessage,
    isLoadingFindChat,
    draftText,
    chat,
    editId,
    startEdit,
    handleClearForm,
    setEditId,
    filesEdited,
    setFilesEdited,
    pinnedMessage,
    setPinnedMessage,
    handleFileSend,
    chatError,
    refetchChat,
  } = useChat(chatId, handleDirectContactBlocked);

  const { typingUsernames, sendTyping } = useTypingIndicator(
    chatId,
    user?.id ?? "",
  );

  useEffect(() => {
    setHasRuntimeBlockedDirectContact(false);
    handledAccessLossRef.current = false;
  }, [chatId]);

  const isGroup = !!(chat as any)?.isGroup;
  const members = (chat as any)?.members ?? [];
  const isDirectContactBlocked =
    hasRuntimeBlockedDirectContact || isDirectContactBlockedError(chatError);
  const directCounterpart = useMemo(() => {
    if (isGroup || !user) {
      return null;
    }

    return (
      members.find((member: any) => member.user?.id !== user.id)?.user ?? null
    );
  }, [isGroup, members, user]);
  const { data: directChatsData } = useFindAllChatsByUserQuery({
    variables: { filters: {} },
    skip: isGroup || !!chat || !user?.id,
    fetchPolicy: "cache-first",
  });
  const fallbackDirectChat = useMemo(
    () =>
      directChatsData?.findAllChatsByUser.find(
        (candidate) => candidate.id === chatId,
      ) ?? null,
    [chatId, directChatsData],
  );
  const chatDisplayName =
    directCounterpart?.username ||
    (fallbackDirectChat
      ? getDirectChatDisplayName(fallbackDirectChat, user?.id)
      : null) ||
    chat?.chatName ||
    t("title");
  const chatDisplayAvatar =
    directCounterpart?.avatarUrl ||
    (fallbackDirectChat
      ? getDirectChatDisplayAvatar(fallbackDirectChat, user?.id)
      : null) ||
    chat?.avatarUrl;
  const chatSubtitle =
    typingUsernames.length > 0
      ? `${typingUsernames.join(", ")} ${t("typing")}`
      : isGroup
        ? members.length > 0
          ? `${members.length} ${t("members")}`
          : null
        : null;
  const pathSegments = pathname.split("/").filter(Boolean);
  const routeGroupId = pathSegments[0] === "group" ? pathSegments[1] : null;
  const currentGroupId = routeGroupId ?? fallbackDirectChat?.groupId ?? null;
  const subscriptionGroupId = isGroup ? (currentGroupId ?? "") : "";
  const backHref = getChatCollectionRoute({
    isGroup,
    groupId: currentGroupId,
  });
  const handleChatAccessLoss = useCallback(() => {
    if (handledAccessLossRef.current) return;

    handledAccessLossRef.current = true;
    router.replace(
      getChatCollectionRoute({
        isGroup,
        groupId: currentGroupId,
      }),
    );
  }, [currentGroupId, isGroup, router]);

  const { data: roleData, loading: isLoadingMemberRole } =
    useGetMemberChatRoleQuery({
      variables: { chatId },
      skip: !isGroup,
    });

  useChatDeletedSubscription({
    variables: {
      groupId: subscriptionGroupId,
      userId: user?.id ?? "",
    },
    skip: !user?.id,
    onData: ({ data }) => {
      if (data.data?.chatDeleted.id !== chatId) return;
      handleChatAccessLoss();
    },
  });

  const messagePermissions = useMemo(() => {
    if (!isGroup) {
      return { canSend: true, canEdit: true, canDelete: true, canPin: true };
    }

    if (isLoadingMemberRole) {
      return {
        canSend: false,
        canEdit: false,
        canDelete: false,
        canPin: false,
      };
    }

    const role = roleData?.getMemberChatRole;
    if (!role) {
      return {
        canSend: false,
        canEdit: false,
        canDelete: false,
        canPin: false,
      };
    }

    if (role.isCreator) {
      return { canSend: true, canEdit: true, canDelete: true, canPin: true };
    }

    const permissions = (role.permissions ?? []) as ChatPermissionEnum[];

    return {
      canSend: permissions.includes(ChatPermissionEnum.SendMessages),
      canEdit: permissions.includes(ChatPermissionEnum.EditMessages),
      canDelete: permissions.includes(ChatPermissionEnum.DeleteMessages),
      canPin: permissions.includes(ChatPermissionEnum.PinMessages),
    };
  }, [isGroup, isLoadingMemberRole, roleData]);

  const isCreator = !!roleData?.getMemberChatRole?.isCreator;
  const canInviteMembers =
    isGroup &&
    (isCreator ||
      (
        (roleData?.getMemberChatRole?.permissions ?? []) as ChatPermissionEnum[]
      ).includes(ChatPermissionEnum.InviteMembers));

  const [leaveChat] = useLeaveChatMutation({
    onCompleted() {
      toast.success(t("leaveChatSuccess"));
      router.push(
        getChatCollectionRoute({
          isGroup: true,
          groupId: currentGroupId,
        }),
      );
    },
    onError(error) {
      toast.error(getGraphQLErrorMessage(error));
    },
  });

  const [inviteMember] = useInviteMemberToChatMutation();
  const { data: groupData } = useFindGroupByGroupIdQuery({
    variables: { groupId: currentGroupId ?? "" },
    skip: !inviteOpen || !isGroup || !currentGroupId,
    fetchPolicy: "network-only",
  });

  const existingIds = new Set(
    members.map((member: any) => member.user?.id ?? member.userId),
  );
  const invitableUsers = (groupData?.findGroupByGroupId?.members ?? [])
    .map((member) => member.user)
    .filter((candidate) => !existingIds.has(candidate.id));

  const handleInvite = async (targetUserId: string) => {
    try {
      await inviteMember({ variables: { chatId, targetUserId } });
      toast.success(tSettings("memberInvited"));
      setInviteOpen(false);
    } catch (error) {
      if (isDirectContactBlockedError(error)) {
        handleDirectContactBlocked();
        return;
      }

      toast.error(getGraphQLErrorMessage(error));
    }
  };

  if (isLoadingProfile) {
    return <div>{t("loadingChat")}</div>;
  }

  if (chatError && !isDirectContactBlocked) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6">
            <Alert variant="destructive">
              <ShieldOff className="size-4" />
              <AlertTitle>{t("chatLoadError")}</AlertTitle>
              <AlertDescription>
                {getGraphQLErrorMessage(chatError)}
              </AlertDescription>
            </Alert>
            <Button onClick={() => refetchChat()}>{tCommon("retry")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingFindChat || !user || (!chat && !isDirectContactBlocked)) {
    return <div>{t("loadingChat")}</div>;
  }

  const chatHeaderContent = (
    <>
      <EntityAvatar
        name={chatDisplayName}
        avatarUrl={chatDisplayAvatar}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold sm:text-lg">
          {chatDisplayName}
        </h2>
        {chatSubtitle && (
          <div className="truncate text-xs text-muted-foreground">
            {typingUsernames.length > 0 ? (
              <span className="animate-pulse text-primary">{chatSubtitle}</span>
            ) : isGroup ? (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {chatSubtitle}
              </span>
            ) : (
              chatSubtitle
            )}
          </div>
        )}
      </div>
    </>
  );

  const shouldShowBlockedChatBody = isDirectContactBlocked && !chat;
  const shouldRenderComposer =
    messagePermissions.canSend || isDirectContactBlocked;

  return (
    <div className="flex h-full w-full flex-col bg-background/10">
      <div className="border-b border-border/60 bg-card/90 px-2 py-2 backdrop-blur sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <BackButton
              href={backHref}
              className="size-10 shrink-0 rounded-full px-0"
              label=""
            />

            {isGroup ? (
              <Link
                href={`${getChatRoute({
                  chatId,
                  groupId: currentGroupId,
                  isGroup,
                })}/settings`}
                className="group flex min-w-0 flex-1 items-center gap-2 rounded-[24px] px-2 py-2 transition-colors hover:bg-background/35 sm:gap-3"
              >
                {chatHeaderContent}
              </Link>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[24px] px-2 py-2 sm:gap-3">
                {chatHeaderContent}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {canInviteMembers && (
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => setInviteOpen(true)}
                title={tSettings("inviteMember")}
              >
                <UserPlus className="size-4" />
              </Button>
            )}
            {isGroup && !isCreator && (
              <ConfirmModal
                heading={t("leaveChat")}
                message={t("leaveChatConfirm")}
                onConfirm={() => leaveChat({ variables: { chatId } })}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full text-destructive"
                  title={t("leaveChat")}
                >
                  <LogOut className="size-4" />
                </Button>
              </ConfirmModal>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-2 pt-2 sm:px-3 sm:pb-3">
        <DragAndDropWrapper
          drop={drop}
          disabled={isDirectContactBlocked}
          className="flex h-full flex-col"
        >
          {shouldShowBlockedChatBody ? (
            <div className="flex flex-1 items-center justify-center px-4">
              <Card className="w-full max-w-xl">
                <CardContent className="flex flex-col items-center gap-4 p-4 text-center sm:p-6">
                  <div className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-full">
                    <ShieldOff className="size-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">
                      {t("blockedChatTitle")}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {t("blockedChatDescription")}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/settings?tab=blocked">
                      {tSettings("manageBlockedUsers")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <ChatMessageList
              pinnedMessage={pinnedMessage}
              setPinnedMessage={setPinnedMessage}
              chatId={chatId}
              startEdit={startEdit}
              userId={user.id}
              handleAddForwardedMessage={handleAddForwardedMessage}
              canEdit={messagePermissions.canEdit}
              canDelete={messagePermissions.canDelete}
              canPin={messagePermissions.canPin}
              canSend={messagePermissions.canSend}
              showSenderName={isGroup}
            />
          )}
          {shouldRenderComposer && (
            <div className="mx-auto w-full max-w-4xl">
              <SendMessageForm
                handleFileSend={handleFileSend}
                handleClearForm={handleClearForm}
                setForwardedMessages={setForwardedMessages}
                draftText={draftText}
                forwardedMessages={forwardedMessages}
                onDeleteFile={handleDelete}
                files={files}
                isLoadingSendFiles={isLoadingSendFile}
                chatId={chatId}
                clearMessageId={handleClearMessageId}
                editId={editId}
                setEditId={setEditId}
                filesEdited={filesEdited}
                setFilesEdited={setFilesEdited}
                canSend={messagePermissions.canSend}
                blockedStateMessage={
                  isDirectContactBlocked
                    ? t("blockedChatComposerMessage")
                    : null
                }
                onTyping={sendTyping}
                onDirectContactBlocked={handleDirectContactBlocked}
              />
            </div>
          )}
        </DragAndDropWrapper>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border/60 bg-background px-6 pb-4 pt-6 pr-12">
            <DialogTitle>{tSettings("inviteMember")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(100dvh-10rem)] space-y-1 overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-16rem)] sm:px-6">
            {invitableUsers.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {tSettings("noUsersToInvite")}
              </p>
            ) : (
              invitableUsers.map((candidate) => (
                <div
                  key={candidate.id}
                  className="hover:bg-primary/10 flex items-center gap-3 rounded-xl p-2"
                >
                  <EntityAvatar
                    name={candidate.username}
                    avatarUrl={candidate.avatarUrl}
                  />
                  <span className="flex-1 text-sm">{candidate.username}</span>
                  <Button size="sm" onClick={() => handleInvite(candidate.id)}>
                    {tSettings("invite")}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
