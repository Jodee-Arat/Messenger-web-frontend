"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/common/Dialog";
import { Input } from "@/components/ui/common/Input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/common/Tabs";
import { Skeleton } from "@/components/ui/common/Skeleton";
import EntityAvatar from "@/components/ui/elements/EntityAvatar";

import { useFriends } from "@/shared/hooks/useFriends";
import { useFindOrCreateDirectChatMutation } from "@/shared/graphql/generated/output";

const Home = () => {
  const router = useRouter();
  const [friendUsername, setFriendUsername] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const t = useTranslations("home");

  const {
    friends,
    incoming,
    outgoing,
    isLoadingFriends,
    isSending,
    handleSendRequest,
    handleAccept,
    handleDecline,
    handleCancel,
    handleRemoveFriend,
    getFriendUser,
  } = useFriends();

  const [findOrCreateDM] = useFindOrCreateDirectChatMutation();

  const handleMessage = async (friendUserId: string) => {
    try {
      const { data } = await findOrCreateDM({
        variables: { friendUserId: friendUserId },
      });
      if (data?.findOrCreateDirectChat) {
        const chat = data.findOrCreateDirectChat;
        router.push(`/group/${chat.groupId}/${chat.id}`);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAddFriend = async () => {
    await handleSendRequest(friendUsername);
    setFriendUsername("");
    setAddDialogOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("friends")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dm">
              <MessageSquare className="mr-2 size-4" />
              {t("messages")}
            </Link>
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 size-4" />
                {t("addFriend")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addFriendTitle")}</DialogTitle>
              </DialogHeader>
              <div className="flex gap-2">
                <Input
                  placeholder={t("enterUsername")}
                  value={friendUsername}
                  onChange={e => setFriendUsername(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddFriend()}
                />
                <Button
                  onClick={handleAddFriend}
                  disabled={!friendUsername.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            {t("all")}{" "}
            {friends.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({friends.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="incoming">
            {t("incoming")}{" "}
            {incoming.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({incoming.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            {t("outgoing")}{" "}
            {outgoing.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({outgoing.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All Friends */}
        <TabsContent value="all" className="mt-4 space-y-2">
          {isLoadingFriends ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : friends.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <Users className="text-primary size-7" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {t("noFriends")}
                </p>
              </CardContent>
            </Card>
          ) : (
            friends.map(f => {
              const u = getFriendUser(f);
              if (!u) return null;
              return (
                <Card key={f.id} className="group">
                  <CardContent className="flex items-center gap-3 p-3">
                    <Link
                      href={`/${u.id}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold hover:underline">
                          {u.username}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("friendsSince")}{" "}
                          {new Date(f.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMessage(u.id)}
                        title={t("sendMessage")}
                      >
                        <MessageSquare className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleRemoveFriend(f.id)}
                        title={t("removeFriend")}
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Incoming Requests */}
        <TabsContent value="incoming" className="mt-4 space-y-2">
          {incoming.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="text-primary size-7" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {t("noIncomingRequests")}
                </p>
              </CardContent>
            </Card>
          ) : (
            incoming.map(req => {
              const u = req.user;
              if (!u) return null;
              return (
                <Card key={req.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{u.username}</p>
                      <p className="text-muted-foreground text-xs">
                        {t("incomingFriendRequest")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="default"
                        onClick={() => handleAccept(req.id)}
                        title={t("accept")}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDecline(req.id)}
                        title={t("decline")}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Outgoing Requests */}
        <TabsContent value="outgoing" className="mt-4 space-y-2">
          {outgoing.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <Send className="text-primary size-7" />
                </div>
                <p className="text-muted-foreground text-sm">
                  {t("noOutgoingRequests")}
                </p>
              </CardContent>
            </Card>
          ) : (
            outgoing.map(req => {
              const u = req.friend;
              if (!u) return null;
              return (
                <Card key={req.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <EntityAvatar name={u.username} avatarUrl={u.avatarUrl} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{u.username}</p>
                      <p className="text-muted-foreground text-xs">
                        {t("outgoingPending")}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleCancel(req.id)}
                      title={t("cancel")}
                    >
                      <X className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
