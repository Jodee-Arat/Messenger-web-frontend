"use client";

import { ApolloProvider } from "@apollo/client";
import { client } from "@/shared/libs/apollo-client";
import { type PropsWithChildren } from "react";

export function ApolloClientProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
