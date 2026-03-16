"use client";

import {
  // useClearSessionCookieMutation,
  useFindProfileQuery,
} from "@/shared/graphql/generated/output";
import { useEffect, useRef } from "react";

import { useAuth } from "./useAuth";

export function useCurrentUser() {
  const { isAuthenticated, exit } = useAuth();

  const { data, loading, refetch, error } = useFindProfileQuery({
    skip: !isAuthenticated,
    fetchPolicy: "network-only",
  });

  // const [clear] = useClearSessionCookieMutation();

  // Track whether we've already handled the error to avoid repeated exit() calls
  const handledErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error && isAuthenticated && handledErrorRef.current !== error.message) {
      handledErrorRef.current = error.message;
      // Only exit on authentication-related errors, not transient network errors
      const isAuthError =
        error.graphQLErrors?.some(
          e =>
            e.extensions?.code === "UNAUTHENTICATED" ||
            e.extensions?.code === "FORBIDDEN",
        ) ||
        error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden");
      if (isAuthError) {
        exit();
      }
    }
    // Reset when there's no error (e.g. after successful re-auth)
    if (!error) {
      handledErrorRef.current = null;
    }
  }, [error, isAuthenticated, exit]);
  // [clear]

  return {
    user: data?.findProfile,
    isLoadingProfile: loading,
    refetch,
  };
}
