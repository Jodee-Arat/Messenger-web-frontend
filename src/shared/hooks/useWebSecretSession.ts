"use client";

import { useCallback, useEffect, useState } from "react";

import {
  RegisterSecretSessionInput,
  SecretSessionPlatform,
  useRegisterSecretSessionMutation,
} from "@/shared/graphql/generated/output";
import { generatePreKey } from "@/shared/libs/secret/gost";
import {
  clearWebSecretSession,
  getStoredWebSecretSessionId,
  getWebSecretSession,
  setWebSecretSession,
  WebSecretSessionMemoryState,
} from "@/shared/libs/secret/secret-session-memory";
import { revokeCurrentWebSecretSession } from "@/shared/libs/secret/web-secret-session-lifecycle";

import { useAuth } from "./useAuth";

type UseWebSecretSessionOptions = {
  autoCreate?: boolean;
};

export function useWebSecretSession(options: UseWebSecretSessionOptions = {}) {
  const { autoCreate = true } = options;
  const { hasHydrated, isAuthenticated } = useAuth();
  const [session, setSession] = useState<WebSecretSessionMemoryState | null>(
    () => getWebSecretSession(),
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSecretSession] = useRegisterSecretSessionMutation();

  const ensureSession = useCallback(async () => {
    if (!hasHydrated || !isAuthenticated) {
      return null;
    }

    const existing = getWebSecretSession();
    if (existing) {
      setSession(existing);
      return existing;
    }

    setIsLoading(true);
    setError(null);

    try {
      const staleSecretSessionId = getStoredWebSecretSessionId();
      if (staleSecretSessionId) {
        await revokeCurrentWebSecretSession();
      }

      const preKey = await generatePreKey();
      const payload: RegisterSecretSessionInput = {
        platform: SecretSessionPlatform.Web,
        deviceName:
          typeof navigator !== "undefined"
            ? `Web: ${navigator.userAgent.slice(0, 80)}`
            : "Web browser",
        publicPreKey: {
          ...preKey.toServer,
          indexOpkPub: 0,
        },
      };

      const response = await registerSecretSession({
        variables: { data: payload },
      });

      const secretSessionId = response.data?.registerSecretSession.id;
      if (!secretSessionId) {
        throw new Error("Secret session was not created");
      }

      const nextSession: WebSecretSessionMemoryState = {
        secretSessionId,
        publicPreKey: payload.publicPreKey,
        privateKeyMaterial: preKey.toStore,
        activatedAt: Date.now(),
        savedChatId: null,
      };

      setWebSecretSession(nextSession);
      setSession(nextSession);

      return nextSession;
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Failed to create a web secret session";
      setError(message);
      throw reason;
    } finally {
      setIsLoading(false);
    }
  }, [hasHydrated, isAuthenticated, registerSecretSession]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      clearWebSecretSession();
      setSession(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const existing = getWebSecretSession();
    if (existing) {
      setSession(existing);
      return;
    }

    if (!autoCreate) {
      setSession(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const nextSession = await ensureSession();
        if (cancelled) return;

        if (nextSession) {
          setSession(nextSession);
        }
      } catch (reason) {
        if (!cancelled) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Failed to create a web secret session",
          );
        }
      } finally {
        if (!cancelled) {
          if (autoCreate) {
            setIsLoading(false);
          }
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [autoCreate, ensureSession, hasHydrated, isAuthenticated]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !session?.secretSessionId) {
      return;
    }

    const handlePageUnload = () => {
      void revokeCurrentWebSecretSession("keepalive");
    };

    window.addEventListener("pagehide", handlePageUnload);
    window.addEventListener("beforeunload", handlePageUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageUnload);
      window.removeEventListener("beforeunload", handlePageUnload);
    };
  }, [hasHydrated, isAuthenticated, session?.secretSessionId]);

  return {
    session,
    isLoading,
    error,
    ensureSession,
  };
}
