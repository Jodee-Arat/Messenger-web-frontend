"use client";

import { client } from "@/shared/libs/apollo-client";
import {
  RevokeSecretSessionDocument,
} from "@/shared/graphql/generated/output";
import { SERVER_URL } from "@/shared/libs/constants/url.constant";

import {
  clearWebSecretSession,
  getStoredWebSecretSessionId,
  getWebSecretSession,
} from "./secret-session-memory";

type RevokeTransport = "apollo" | "keepalive";

const REVOKE_SECRET_SESSION_MUTATION = `
  mutation RevokeSecretSession($secretSessionId: String!) {
    revokeSecretSession(secretSessionId: $secretSessionId)
  }
`;

const revokedSessionIds = new Set<string>();

async function revokeViaApollo(secretSessionId: string) {
  await client.mutate({
    mutation: RevokeSecretSessionDocument,
    variables: {
      secretSessionId,
    },
    fetchPolicy: "no-cache",
  });
}

async function revokeViaKeepalive(secretSessionId: string) {
  const body = JSON.stringify({
    query: REVOKE_SECRET_SESSION_MUTATION,
    variables: {
      secretSessionId,
    },
  });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const queued = navigator.sendBeacon(
      SERVER_URL,
      new Blob([body], { type: "application/json" }),
    );

    if (queued) return;
  }

  await fetch(SERVER_URL, {
    method: "POST",
    credentials: "include",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function revokeCurrentWebSecretSession(
  transport: RevokeTransport = "apollo",
) {
  const currentSession = getWebSecretSession();
  const secretSessionId =
    currentSession?.secretSessionId ?? getStoredWebSecretSessionId();

  if (!secretSessionId || revokedSessionIds.has(secretSessionId)) {
    clearWebSecretSession();
    return false;
  }

  revokedSessionIds.add(secretSessionId);

  try {
    if (transport === "keepalive") {
      await revokeViaKeepalive(secretSessionId);
    } else {
      await revokeViaApollo(secretSessionId);
    }

    return true;
  } catch {
    revokedSessionIds.delete(secretSessionId);

    return false;
  } finally {
    clearWebSecretSession();
  }
}
