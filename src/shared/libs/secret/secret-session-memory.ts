import { PreKeyInput } from "@/shared/graphql/generated/output";

import { PreKeyBundleClient } from "./gost";

export type SavedSecretMessageMemory = {
  id: string;
  plaintext: string;
  direction: "incoming" | "outgoing";
  createdAt: number;
  fromSessionId?: string | null;
};

export type WebSecretSessionMemoryState = {
  secretSessionId: string;
  publicPreKey: PreKeyInput;
  privateKeyMaterial: PreKeyBundleClient;
  savedChatId?: string | null;
  activatedAt: number;
};

let webSecretSession: WebSecretSessionMemoryState | null = null;
const savedSecretMessages = new Map<string, SavedSecretMessageMemory>();
const savedSecretLocalAttachmentUrls = new Map<string, string>();
const WEB_SECRET_SESSION_ID_STORAGE_KEY = "mesarat:web-secret-session-id";

const getSessionStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const getStoredWebSecretSessionId = () => {
  return getSessionStorage()?.getItem(WEB_SECRET_SESSION_ID_STORAGE_KEY) ?? null;
};

export const setStoredWebSecretSessionId = (secretSessionId: string) => {
  getSessionStorage()?.setItem(
    WEB_SECRET_SESSION_ID_STORAGE_KEY,
    secretSessionId,
  );
};

export const clearStoredWebSecretSessionId = () => {
  getSessionStorage()?.removeItem(WEB_SECRET_SESSION_ID_STORAGE_KEY);
};

export const setWebSecretSession = (session: WebSecretSessionMemoryState) => {
  webSecretSession = session;
  setStoredWebSecretSessionId(session.secretSessionId);
};

export const getWebSecretSession = () => webSecretSession;

export const patchWebSecretSession = (
  patch: Partial<WebSecretSessionMemoryState>,
) => {
  if (!webSecretSession) return null;

  webSecretSession = {
    ...webSecretSession,
    ...patch,
  };

  return webSecretSession;
};

export const clearWebSecretSession = (options?: {
  keepStoredSessionId?: boolean;
}) => {
  webSecretSession = null;
  savedSecretMessages.clear();
  savedSecretLocalAttachmentUrls.forEach((url) => {
    if (typeof URL !== "undefined" && URL.revokeObjectURL) {
      URL.revokeObjectURL(url);
    }
  });
  savedSecretLocalAttachmentUrls.clear();

  if (!options?.keepStoredSessionId) {
    clearStoredWebSecretSessionId();
  }
};

export const upsertSavedSecretMessageInMemory = (
  message: SavedSecretMessageMemory,
) => {
  savedSecretMessages.set(message.id, message);
};

export const getSavedSecretMessagesFromMemory = () =>
  Array.from(savedSecretMessages.values()).sort(
    (left, right) =>
      left.createdAt - right.createdAt || left.id.localeCompare(right.id),
  );

export const setSavedSecretLocalAttachmentUrl = (
  attachmentId: string,
  objectUrl: string,
) => {
  const previousUrl = savedSecretLocalAttachmentUrls.get(attachmentId);
  if (previousUrl && typeof URL !== "undefined" && URL.revokeObjectURL) {
    URL.revokeObjectURL(previousUrl);
  }

  savedSecretLocalAttachmentUrls.set(attachmentId, objectUrl);
};

export const getSavedSecretLocalAttachmentUrl = (attachmentId: string) =>
  savedSecretLocalAttachmentUrls.get(attachmentId) ?? null;
