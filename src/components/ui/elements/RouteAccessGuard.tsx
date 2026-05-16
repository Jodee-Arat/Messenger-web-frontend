"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { LockKeyhole, ShieldAlert, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  useCheckChatAccessQuery,
  useCheckGroupAccessQuery,
} from "@/shared/graphql/generated/output";
import { useAuth } from "@/shared/hooks/useAuth";
import { getGraphQLErrorMessage } from "@/shared/utils/direct-contact-blocked";

import { Button } from "../common/Button";
import { Card, CardContent } from "../common/Card";

type AccessScope = "auth" | "group" | "chat";

interface RouteAccessGuardProps {
  children: ReactNode;
  scope: AccessScope;
  groupId?: string;
  chatId?: string;
  fallbackHref?: string;
}

const hasAuthLikeMessage = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const messages = [
    "message" in error && typeof error.message === "string"
      ? error.message
      : null,
    ...("graphQLErrors" in error && Array.isArray(error.graphQLErrors)
      ? error.graphQLErrors
      : []
    ).flatMap((graphQLError) =>
      typeof graphQLError?.message === "string" ? [graphQLError.message] : [],
    ),
  ].filter((message): message is string => Boolean(message));

  return messages.some((message) => {
    const normalized = message.toLowerCase();

    return (
      normalized.includes("unauthorized") ||
      normalized.includes("forbidden") ||
      normalized.includes("unauthenticated")
    );
  });
};

const GuardCard = ({
  icon,
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actions: ReactNode;
}) => (
  <div className="flex min-h-full flex-1 items-center justify-center p-4 sm:p-6">
    <Card className="w-full max-w-xl border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
        <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
          {icon}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm leading-6">
            {description}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {actions}
        </div>
      </CardContent>
    </Card>
  </div>
);

const GuardLoadingState = () => (
  <div className="flex min-h-full flex-1 items-center justify-center p-4 sm:p-6">
    <div className="flex flex-col items-center gap-4">
      <div className="border-primary/30 border-t-primary size-10 animate-spin rounded-full border-2" />
    </div>
  </div>
);

const RouteAccessGuard = ({
  children,
  scope,
  groupId,
  chatId,
  fallbackHref = "/",
}: RouteAccessGuardProps) => {
  const t = useTranslations("routeGuard");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuth();

  const loginHref = useMemo(() => {
    if (!pathname) {
      return "/account/login";
    }

    return `/account/login?next=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  const shouldCheckGroupAccess =
    scope === "group" && hasHydrated && isAuthenticated && !!groupId;
  const shouldCheckChatAccess =
    scope === "chat" && hasHydrated && isAuthenticated && !!chatId;

  const {
    data: groupAccessData,
    loading: isLoadingGroupAccess,
    error: groupAccessError,
    refetch: refetchGroupAccess,
  } = useCheckGroupAccessQuery({
    variables: { groupId: groupId ?? "" },
    skip: !shouldCheckGroupAccess,
    fetchPolicy: "network-only",
  });

  const {
    data: chatAccessData,
    loading: isLoadingChatAccess,
    error: chatAccessError,
    refetch: refetchChatAccess,
  } = useCheckChatAccessQuery({
    variables: { chatId: chatId ?? "" },
    skip: !shouldCheckChatAccess,
    fetchPolicy: "network-only",
  });

  const isLoadingAccess =
    (scope === "group" && isLoadingGroupAccess) ||
    (scope === "chat" && isLoadingChatAccess);
  const isAwaitingInitialAccessResult =
    (scope === "group" &&
      shouldCheckGroupAccess &&
      typeof groupAccessData?.checkGroupAccess !== "boolean" &&
      !groupAccessError) ||
    (scope === "chat" &&
      shouldCheckChatAccess &&
      typeof chatAccessData?.checkChatAccess !== "boolean" &&
      !chatAccessError);
  const shouldShowLoadingState =
    !hasHydrated ||
    (scope !== "auth" && (isLoadingAccess || isAwaitingInitialAccessResult));
  const accessAllowed =
    scope === "auth"
      ? true
      : scope === "group"
        ? (groupAccessData?.checkGroupAccess ?? false)
        : (chatAccessData?.checkChatAccess ?? false);
  const accessError =
    scope === "group"
      ? groupAccessError
      : scope === "chat"
        ? chatAccessError
        : null;

  useEffect(() => {
    if (!hasHydrated || isAuthenticated) {
      return;
    }

    router.replace(loginHref);
  }, [hasHydrated, isAuthenticated, loginHref, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !accessError) {
      return;
    }

    if (hasAuthLikeMessage(accessError)) {
      router.replace(loginHref);
    }
  }, [accessError, hasHydrated, isAuthenticated, loginHref, router]);

  if (shouldShowLoadingState) {
    return <GuardLoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <GuardCard
        icon={<LockKeyhole className="size-7" />}
        title={t("loginRequiredTitle")}
        description={t("loginRequiredDescription")}
        actions={
          <>
            <Button asChild>
              <Link href={loginHref}>{tAuth("login")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">{tCommon("goHome")}</Link>
            </Button>
          </>
        }
      />
    );
  }

  if (accessError && hasAuthLikeMessage(accessError)) {
    return (
      <GuardCard
        icon={<LockKeyhole className="size-7" />}
        title={t("loginRequiredTitle")}
        description={t("loginRequiredDescription")}
        actions={
          <>
            <Button asChild>
              <Link href={loginHref}>{tAuth("login")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">{tCommon("goHome")}</Link>
            </Button>
          </>
        }
      />
    );
  }

  if (accessError && !hasAuthLikeMessage(accessError)) {
    const handleRetry = async () => {
      if (scope === "group") {
        await refetchGroupAccess();
        return;
      }

      if (scope === "chat") {
        await refetchChatAccess();
      }
    };

    return (
      <GuardCard
        icon={<TriangleAlert className="size-7" />}
        title={t("accessCheckFailedTitle")}
        description={getGraphQLErrorMessage(
          accessError,
          t("accessCheckFailedDescription"),
        )}
        actions={
          <>
            <Button onClick={() => void handleRetry()}>
              {tCommon("retry")}
            </Button>
            <Button variant="outline" asChild>
              <Link href={fallbackHref}>{tCommon("back")}</Link>
            </Button>
          </>
        }
      />
    );
  }

  if (scope !== "auth" && !accessAllowed) {
    return (
      <GuardCard
        icon={<ShieldAlert className="size-7" />}
        title={t("accessDeniedTitle")}
        description={t("accessDeniedDescription")}
        actions={
          <>
            <Button asChild>
              <Link href={fallbackHref}>{tCommon("back")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">{tCommon("goHome")}</Link>
            </Button>
          </>
        }
      />
    );
  }

  return <>{children}</>;
};

export default RouteAccessGuard;
