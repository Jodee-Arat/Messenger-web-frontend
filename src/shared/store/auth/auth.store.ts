import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AuthStore } from "./auth.type";

export const authStore = create(
  persist<AuthStore>(
    set => ({
      isAuthenticated: false,
      _hasHydrated: false,
      setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
