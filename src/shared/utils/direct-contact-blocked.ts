const DIRECT_CONTACT_BLOCKED_MESSAGE =
  "direct contact is unavailable because one of the users has blocked the other";

const getMessage = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return null;
  }

  return "message" in error && typeof error.message === "string"
    ? error.message
    : null;
};

const getGraphQLErrorMessages = (error: unknown) => {
  if (
    !error ||
    typeof error !== "object" ||
    !("graphQLErrors" in error) ||
    !Array.isArray(error.graphQLErrors)
  ) {
    return [] as string[];
  }

  return error.graphQLErrors.flatMap((graphQLError) => {
    const message = getMessage(graphQLError);
    return message ? [message] : [];
  });
};

export const getGraphQLErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  const message = getMessage(error);
  if (message) {
    return message;
  }

  const [graphQLErrorMessage] = getGraphQLErrorMessages(error);
  return graphQLErrorMessage ?? fallback;
};

export const isDirectContactBlockedError = (error: unknown) => {
  const messages = [getMessage(error), ...getGraphQLErrorMessages(error)];

  return messages.some(
    (message): message is string =>
      typeof message === "string" &&
      message.toLowerCase().includes(DIRECT_CONTACT_BLOCKED_MESSAGE),
  );
};
