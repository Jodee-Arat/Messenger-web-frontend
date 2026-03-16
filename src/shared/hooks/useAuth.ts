import { useCallback } from "react";

import { authStore } from "@/shared/store/auth/auth.store";

export const useAuth = () => {
  const isAuthenticated = authStore(state => state.isAuthenticated);
  const hasHydrated = authStore(state => state._hasHydrated);
  const setIsAuthenticated = authStore(state => state.setIsAuthenticated);

  const auth = useCallback(
    () => setIsAuthenticated(true),
    [setIsAuthenticated],
  );
  const exit = useCallback(
    () => setIsAuthenticated(false),
    [setIsAuthenticated],
  );

  return {
    isAuthenticated,
    hasHydrated,
    auth,
    exit,
  };
};
