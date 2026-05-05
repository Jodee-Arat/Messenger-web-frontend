import { ApolloClient, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

import { SERVER_URL, WEBSOCKET_URL } from "./constants/url.constant";

const httpLink = createUploadLink({
  uri: SERVER_URL,
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

const wsLink = new WebSocketLink({
  uri: WEBSOCKET_URL,
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getSecretSessionPreKeys: {
            keyArgs: ["chatId"],
            merge(_existing, incoming) {
              return incoming;
            },
          },
          getSessionSecretMessages: {
            keyArgs: ["chatId", "secretSessionId"],
            merge(_existing, incoming) {
              return incoming;
            },
          },
          getSessionSharedSecretKeys: {
            keyArgs: ["chatId", "secretSessionId"],
            merge(_existing, incoming) {
              return incoming;
            },
          },
        },
      },
      ChatModel: {
        fields: {
          members: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
        },
      },
      SecretSessionPreKeyModel: {
        keyFields: ["secretSessionId"],
      },
      QueueSecretMessageModel: {
        keyFields: ["id"],
      },
      QueueSharedSecretKeyModel: {
        keyFields: ["id"],
      },
    },
  }),
});
