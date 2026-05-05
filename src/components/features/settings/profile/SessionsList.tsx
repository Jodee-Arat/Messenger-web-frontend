"use client";

import { Globe, Monitor, Smartphone, Loader2, MapPin, LogOut } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import {
  useFindSessionsByUserQuery,
  useFindCurrentSessionQuery,
  useRemoveSessionMutation,
  FindSessionsByUserDocument,
} from "@/shared/graphql/generated/output";

function getDeviceIcon(type: string) {
  if (type.toLowerCase().includes("mobile")) {
    return <Smartphone className="size-5" />;
  }
  return <Monitor className="size-5" />;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionsList() {
  const t = useTranslations("sessions");
  const { data: sessionsData, loading: loadingSessions } =
    useFindSessionsByUserQuery();
  const { data: currentData, loading: loadingCurrent } =
    useFindCurrentSessionQuery();

  const [removeSession] = useRemoveSessionMutation({
    refetchQueries: [{ query: FindSessionsByUserDocument }],
  });

  const [removingId, setRemovingId] = useState<string | null>(null);

  const sessions = sessionsData?.findSessionsByUser ?? [];
  const currentSession = currentData?.findCurrentSession;

  const handleRemoveSession = async (sessionId: string) => {
    setRemovingId(sessionId);
    try {
      await removeSession({ variables: { id: sessionId } });
    } catch (error) {
      console.error("Failed to remove session:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (loadingSessions || loadingCurrent) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentSession && (
        <Card className="border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="size-2 rounded-full bg-green-500" />
              {t("currentSession")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SessionRow session={currentSession} isCurrent />
          </CardContent>
        </Card>
      )}

      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {t("otherSessions")} ({sessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map(session => (
              <SessionRow
                key={session.id}
                session={session}
                onRemove={() => handleRemoveSession(session.id)}
                isRemoving={removingId === session.id}
                removeLabel={t("terminate")}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 && !currentSession && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("noSessions")}
        </p>
      )}
    </div>
  );
}

interface SessionRowProps {
  session: {
    id: string;
    createdAt: string;
    metadata: {
      ip: string;
      device: { browser: string; os: string; type: string };
      location: { city: string; country: string };
    };
  };
  isCurrent?: boolean;
  onRemove?: () => void;
  isRemoving?: boolean;
  removeLabel?: string;
}

function SessionRow({ session, isCurrent, onRemove, isRemoving, removeLabel }: SessionRowProps) {
  const t = useTranslations("sessions");
  const { metadata } = session;

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">
        {getDeviceIcon(metadata.device.type)}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">
          {metadata.device.browser} on {metadata.device.os}
          {isCurrent && (
            <span className="ml-2 text-xs text-green-500">
              ({t("current")})
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Globe className="size-3" />
            {metadata.ip}
          </span>
          {(metadata.location.city || metadata.location.country) && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {[metadata.location.city, metadata.location.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(session.createdAt)}
        </p>
      </div>
      {!isCurrent && onRemove && (
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="mt-1 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          title={removeLabel || "Terminate"}
        >
          {isRemoving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          <span className="hidden sm:inline">{removeLabel || "Terminate"}</span>
        </button>
      )}
    </div>
  );
}
