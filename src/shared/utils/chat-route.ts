interface ChatRouteParams {
  chatId: string;
  isGroup: boolean;
  groupId?: string | null;
}

interface ChatCollectionRouteParams {
  isGroup: boolean;
  groupId?: string | null;
}

export const getChatRoute = ({
  chatId,
  isGroup,
  groupId,
}: ChatRouteParams) => {
  if (!isGroup) {
    return `/dm/${chatId}`;
  }

  return `/group/${groupId}/${chatId}`;
};

export const getChatCollectionRoute = ({
  isGroup,
  groupId,
}: ChatCollectionRouteParams) => {
  if (!isGroup) {
    return "/dm";
  }

  return `/group/${groupId}`;
};

export const isLegacyDirectChatRoute = (groupId?: string | null) =>
  groupId === "null";
