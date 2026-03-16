"use client";

import { useCurrentUser } from "./useCurrentUser";

export function useUser() {
  const { user } = useCurrentUser();
  return { userId: user?.id ?? "" };
}
