"use client";

import { useChat } from "@/shared/hooks/useChat";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useTypingIndicator } from "@/shared/hooks/useTypingIndicator";
import { LogOut, Settings2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/common/Dialog";
import DragAndDropWrapper from "@/components/ui/elements/DragAndDropWrapper";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";

import ChatMessageList from "./message/list/ChatMessageList";
import SendMessageForm from "./message/send/SendMessageForm";

import {
  ChatPermissionEnum,
  useGetMemberChatRoleQuery,
  useLeaveChatMutation,
  useInviteMemberToChatMutation,
  useFindAllUsersQuery,
} from "@/shared/graphql/generated/output";

interface ChatProp {
  chatId: string;
}

const Chat: FC<ChatProp> = ({ chatId }) => {
  const { user, isLoadingProfile } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const t = useTranslations("chats");
  const tSettings = useTranslations("settings");

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
  } = useChat(chatId);

  const { typingUsernames, sendTyping } = useTypingIndicator(chatId, user?.id ?? "");

  const isGroup = !!(chat as any)?.isGroup;
  const members = (chat as any)?.members ?? [];

  // ── Permissions ──
  const { data: roleData } = useGetMemberChatRoleQuery({
    variables: { chatId },
    skip: !isGroup,
  });

  const messagePermissions = useMemo(() => {
    if (!isGroup) {
      return { canSend: true, canEdit: true, canDelete: true, canPin: true };
    }
    const role = roleData?.getMemberChatRole;
    if (!role) {
      return { canSend: true, canEdit: true, canDelete: true, canPin: true };
    }
    if (role.isCreator) {
      return { canSend: true, canEdit: true, canDelete: true, canPin: true };
    }
    const p = (role.permissions ?? []) as ChatPermissionEnum[];
    return {
      canSend: p.includes(ChatPermissionEnum.SendMessages),
      canEdit: p.includes(ChatPermissionEnum.EditMessages),
      canDelete: p.includes(ChatPermissionEnum.DeleteMessages),
      canPin: p.includes(ChatPermissionEnum.PinMessages),
    };
  }, [isGroup, roleData]);

  const isCreator = !!roleData?.getMemberChatRole?.isCreator;
  const canInviteMembers =
    isGroup &&
    (isCreator ||
      (
        (roleData?.getMemberChatRole?.permissions ?? []) as ChatPermissionEnum[]
      ).includes(ChatPermissionEnum.InviteMembers));

  // ── Mutations ──
  const [leaveChat] = useLeaveChatMutation({
    onCompleted() {
      toast.success(t("leaveChatSuccess"));
      const groupSegment = pathname.split("/group/")[1]?.split("/")[0];
      router.push(groupSegment ? `/group/${groupSegment}` : "/");
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const [inviteMember] = useInviteMemberToChatMutation();
  const { data: usersData } = useFindAllUsersQuery({ skip: !inviteOpen });

  const existingIds = new Set(members.map((m: any) => m.user?.id ?? m.userId));
  const invitableUsers = (usersData?.findAllUsers ?? []).filter(
    u => !existingIds.has(u.id),
  );

  const handleInvite = async (targetUserId: string) => {
    try {
      await inviteMember({ variables: { chatId, targetUserId } });
      toast.success(tSettings("memberInvited"));
      setInviteOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (isLoadingFindChat || isLoadingProfile || !user || !chat) {
    return <div>{t("loadingChat")}</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Chat Header */}
      <div className="flex flex-row items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <EntityAvatar name={chat?.chatName ?? ""} avatarUrl={null} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold">{chat?.chatName}</h2>
            {typingUsernames.length > 0 ? (
              <p className="text-xs text-primary animate-pulse">
                {typingUsernames.join(", ") + " печатает…"}
              </p>
            ) : (
              isGroup && members.length > 0 && (
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
            userId={user!.id}
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
          />
        </DragAndDropWrapper>
      </div>

      {/* Invite Dialog */}
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
              invitableUsers.map(u => (
                <div
                  key={u.id}
                  className="hover:bg-primary/10 flex items-center gap-3 rounded-md p-2"
                >
                  <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                  <span className="flex-1 text-sm">{u.username}</span>
                  <Button size="sm" onClick={() => handleInvite(u.id)}>
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
