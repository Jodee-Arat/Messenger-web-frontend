export interface AuthStore {
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}
