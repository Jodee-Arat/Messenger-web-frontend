"use client";

import { useCallback, useRef, useState } from "react";
import { useStartTypingMutation, useTypingStartedSubscription } from "../graphql/generated/output";


const TYPING_TIMEOUT_MS = 3000;
const DEBOUNCE_MS = 2000;


export function useTypingIndicator(chatId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<
    Map<string, { username: string; timeout: ReturnType<typeof setTimeout> }>
  >(new Map());
  const lastSentRef = useRef<number>(0);

  const [startTypingMutation] = useStartTypingMutation();

  useTypingStartedSubscription({
    variables: { chatId, userId },
    onData: ({ data }) => {
      const info = data?.data?.typingStarted;
      if (!info) return;

      setTypingUsers(prev => {
        const next = new Map(prev);

        const existing = next.get(info.userId);
        if (existing) clearTimeout(existing.timeout);

        const timeout = setTimeout(() => {
          setTypingUsers(p => {
            const updated = new Map(p);
            updated.delete(info.userId);
            return updated;
          });
        }, TYPING_TIMEOUT_MS);

        next.set(info.userId, { username: info.username, timeout });
        return next;
      });
    },
  });

  const sendTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastSentRef.current < DEBOUNCE_MS) return;
    lastSentRef.current = now;

    startTypingMutation({ variables: { chatId } }).catch(() => {});
  }, [chatId, startTypingMutation]);

  const typingUsernames = Array.from(typingUsers.values()).map(v => v.username);

  return { typingUsernames, sendTyping };
}
