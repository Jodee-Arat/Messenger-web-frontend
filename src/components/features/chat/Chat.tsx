"use client";

import { useChat } from "@/shared/hooks/useChat";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useTypingIndicator } from "@/shared/hooks/useTypingIndicator";
import { LogOut, Settings2, ShieldOff, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/common/Alert";
import { Button } from "@/components/ui/common/Button";
import { Card, CardContent } from "@/components/ui/common/Card";
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
  useFindAllUsersQuery,
  useGetMemberChatRoleQuery,
  useInviteMemberToChatMutation,
  useLeaveChatMutation,
} from "@/shared/graphql/generated/output";
import {
  getGraphQLErrorMessage,
  isDirectContactBlockedError,
} from "@/shared/utils/direct-contact-blocked";

import ChatMessageList from "./message/list/ChatMessageList";
import SendMessageForm from "./message/send/SendMessageForm";

interface ChatProp {
  chatId: string;
}

const Chat: FC<ChatProp> = ({ chatId }) => {
  const { user, isLoadingProfile } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
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
  }, [chatId]);

  const isGroup = !!(chat as any)?.isGroup;
  const members = (chat as any)?.members ?? [];
  const isDirectContactBlocked =
    hasRuntimeBlockedDirectContact || isDirectContactBlockedError(chatError);

  const { data: roleData } = useGetMemberChatRoleQuery({
    variables: { chatId },
    skip: !isGroup,
  });

  const messagePermissions = useMemo(() => {
    if (!isGroup) {
      return { canSend: true, canEdit: true, canDelete: true, canPin: true };
    }

    const role = roleData?.getMemberChatRole;
    if (!role || role.isCreator) {
      return { canSend: true, canEdit: true, canDelete: true, canPin: true };
    }

    const permissions = (role.permissions ?? []) as ChatPermissionEnum[];

    return {
      canSend: permissions.includes(ChatPermissionEnum.SendMessages),
      canEdit: permissions.includes(ChatPermissionEnum.EditMessages),
      canDelete: permissions.includes(ChatPermissionEnum.DeleteMessages),
      canPin: permissions.includes(ChatPermissionEnum.PinMessages),
    };
  }, [isGroup, roleData]);

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
      const groupSegment = pathname.split("/group/")[1]?.split("/")[0];
      router.push(groupSegment ? `/group/${groupSegment}` : "/");
    },
    onError(error) {
      toast.error(getGraphQLErrorMessage(error));
    },
  });

  const [inviteMember] = useInviteMemberToChatMutation();
  const { data: usersData } = useFindAllUsersQuery({ skip: !inviteOpen });

  const existingIds = new Set(
    members.map((member: any) => member.user?.id ?? member.userId),
  );
  const invitableUsers = (usersData?.findAllUsers ?? []).filter(
    (candidate) => !existingIds.has(candidate.id),
  );

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

  if (isDirectContactBlocked) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full">
              <ShieldOff className="text-primary size-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{t("blockedChatTitle")}</h2>
              <p className="text-muted-foreground text-sm">
                {t("blockedChatDescription")}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dm")}
              >
                {tCommon("back")}
              </Button>
              <Button asChild className="flex-1">
                <Link href="/settings?tab=blocked">
                  {tSettings("manageBlockedUsers")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (chatError) {
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

  if (isLoadingFindChat || !user || !chat) {
    return <div>{t("loadingChat")}</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-row items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <EntityAvatar name={chat.chatName ?? ""} avatarUrl={null} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">{chat.chatName}</h2>
            {typingUsernames.length > 0 ? (
              <p className="text-xs text-primary animate-pulse">
                {typingUsernames.join(", ") + " печатает..."}
              </p>
            ) : (
              isGroup &&
              members.length > 0 && (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Users className="size-3" />
                  {members.length} {t("members")}
                </p>
              )
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canInviteMembers && (
            <Button
              size="icon"
              variant="ghost"
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
                className="text-destructive"
                title={t("leaveChat")}
              >
                <LogOut className="size-4" />
              </Button>
            </ConfirmModal>
          )}
          <Button size="icon" variant="default">
            <Link href={`${pathname}/settings`}>
              <Settings2 className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        <DragAndDropWrapper drop={drop} className="flex h-full flex-col">
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
          />
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
            onTyping={sendTyping}
            onDirectContactBlocked={handleDirectContactBlocked}
          />
        </DragAndDropWrapper>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tSettings("inviteMember")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {invitableUsers.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {tSettings("noUsersToInvite")}
              </p>
            ) : (
              invitableUsers.map((candidate) => (
                <div
                  key={candidate.id}
                  className="hover:bg-primary/10 flex items-center gap-3 rounded-md p-2"
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
