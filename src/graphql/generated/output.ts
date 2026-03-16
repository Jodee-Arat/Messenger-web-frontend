import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type AttachFileModel = {
  __typename?: 'AttachFileModel';
  chatDraftMessageId: Scalars['String']['output'];
  fileId: Scalars['String']['output'];
};

export type AuthModel = {
  __typename?: 'AuthModel';
  accessToken?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  sessionId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UserModel>;
};

export type ChangeChatInfoInput = {
  chatName: Scalars['String']['input'];
  description: Scalars['String']['input'];
};

export type ChangeGroupInfoInput = {
  description: Scalars['String']['input'];
  groupName: Scalars['String']['input'];
};

export type ChangeProfileInfoInput = {
  bio: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type ChatDraftMessageModel = {
  __typename?: 'ChatDraftMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  editId?: Maybe<Scalars['String']['output']>;
  files: Array<FileMessageModel>;
  filesEditId: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isForwarded: Scalars['Boolean']['output'];
  repliedToLinks: Array<ChatDraftMessageReplyModel>;
  text: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type ChatMemberModel = {
  __typename?: 'ChatMemberModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isCreator?: Maybe<Scalars['Boolean']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type ChatMessageIdModel = {
  __typename?: 'ChatMessageIdModel';
  id: Scalars['String']['output'];
};

export type ChatMessageModel = {
  __typename?: 'ChatMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  draftOfChat?: Maybe<Array<ChatModel>>;
  draftOfChatId?: Maybe<Scalars['String']['output']>;
  files?: Maybe<Array<FileMessageModel>>;
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isDraft: Scalars['Boolean']['output'];
  isEdited: Scalars['Boolean']['output'];
  isForwarded: Scalars['Boolean']['output'];
  isReply: Scalars['Boolean']['output'];
  isStarted: Scalars['Boolean']['output'];
  lastMessageForChat?: Maybe<ChatModel>;
  pinnedInChat?: Maybe<ChatModel>;
  readCount?: Maybe<Scalars['String']['output']>;
  repliedToLinks?: Maybe<Array<Maybe<ChatMessageReplyModel>>>;
  replies?: Maybe<Array<Maybe<ChatMessageReplyModel>>>;
  text?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type ChatMessageReplyModel = {
  __typename?: 'ChatMessageReplyModel';
  id: Scalars['ID']['output'];
  repliedTo?: Maybe<ChatMessageModel>;
  repliedToId: Scalars['String']['output'];
  reply?: Maybe<ChatMessageModel>;
  replyId: Scalars['String']['output'];
};

export type ChatModel = {
  __typename?: 'ChatModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chatName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  draftMessages?: Maybe<Array<ChatDraftMessageModel>>;
  group?: Maybe<GroupModel>;
  groupId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isGroup: Scalars['Boolean']['output'];
  isSecret: Scalars['Boolean']['output'];
  lastMessage?: Maybe<ChatMessageModel>;
  lastMessageAt?: Maybe<Scalars['DateTime']['output']>;
  lastMessageId?: Maybe<Scalars['String']['output']>;
  members: Array<ChatMemberModel>;
  pinnedMessage?: Maybe<ChatMessageModel>;
  pinnedMessageId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateChatInput = {
  chatName: Scalars['String']['input'];
  isGroup: Scalars['Boolean']['input'];
  isSecret?: InputMaybe<Scalars['Boolean']['input']>;
  userIds: Array<Scalars['String']['input']>;
};

export type CreateGroupInput = {
  groupName: Scalars['String']['input'];
  userIds: Array<Scalars['String']['input']>;
};

export type CreateUserWEmailInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type DeviceModel = {
  __typename?: 'DeviceModel';
  browser: Scalars['String']['output'];
  os: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type FileDownloadData = {
  __typename?: 'FileDownloadData';
  fileUrl: Scalars['String']['output'];
  filename: Scalars['String']['output'];
};

export type FileMessageModel = {
  __typename?: 'FileMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  chatMessage?: Maybe<ChatMessageModel>;
  chatMessageId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  draftMessage?: Maybe<ChatDraftMessageModel>;
  draftMessageId: Scalars['String']['output'];
  fileFormat: Scalars['String']['output'];
  fileFullName: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSize: Scalars['String']['output'];
  fileUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type FiltersInput = {
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Float']['input']>;
  take?: InputMaybe<Scalars['Float']['input']>;
};

export type GroupMemberModel = {
  __typename?: 'GroupMemberModel';
  createdAt: Scalars['DateTime']['output'];
  group: GroupModel;
  groupId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCreator?: Maybe<Scalars['Boolean']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type GroupModel = {
  __typename?: 'GroupModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chats: Array<ChatModel>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  groupName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  members: Array<GroupMemberModel>;
  updatedAt: Scalars['DateTime']['output'];
};

export type LocationModel = {
  __typename?: 'LocationModel';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
};

export type LoginInput = {
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
  pin?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  changeChatAvatar: Scalars['String']['output'];
  changeChatInfo: Scalars['Boolean']['output'];
  changeGroupAvatar: Scalars['String']['output'];
  changeGroupInfo: Scalars['Boolean']['output'];
  changeProfileAvatar: Scalars['String']['output'];
  changeProfileInfo: Scalars['Boolean']['output'];
  clearSessionCookie: Scalars['Boolean']['output'];
  createChat: ChatModel;
  createGroup: GroupModel;
  createUserWEmail: Scalars['Boolean']['output'];
  deleteChat: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  downloadFile: FileDownloadData;
  forwardChatMessage: Scalars['Boolean']['output'];
  loginUser: AuthModel;
  logoutUser: Scalars['Boolean']['output'];
  pinChat: Scalars['Boolean']['output'];
  pinMessage: Scalars['Boolean']['output'];
  refreshToken: Scalars['String']['output'];
  removeChatAvatar: Scalars['Boolean']['output'];
  removeDraft: Scalars['Boolean']['output'];
  removeFile: Scalars['Boolean']['output'];
  removeGroupAvatar: Scalars['Boolean']['output'];
  removeMessages: Scalars['Boolean']['output'];
  removeProfileAvatar: Scalars['Boolean']['output'];
  sendChatDraftMessage: Scalars['Boolean']['output'];
  sendChatMessage: Scalars['Boolean']['output'];
  sendFile: AttachFileModel;
  sendPreKey: Scalars['Boolean']['output'];
  sendSecretMessage: QueueSecretMessageModel;
  sendSharedSecretKey: QueueSharedSecretKeyModel;
  unPinChat: Scalars['Boolean']['output'];
  unPinMessage: Scalars['Boolean']['output'];
};


export type MutationChangeChatAvatarArgs = {
  avatar: Scalars['Upload']['input'];
  chatId: Scalars['String']['input'];
};


export type MutationChangeChatInfoArgs = {
  chatId: Scalars['String']['input'];
  data: ChangeChatInfoInput;
};


export type MutationChangeGroupAvatarArgs = {
  avatar: Scalars['Upload']['input'];
  groupId: Scalars['String']['input'];
};


export type MutationChangeGroupInfoArgs = {
  data: ChangeGroupInfoInput;
  groupId: Scalars['String']['input'];
};


export type MutationChangeProfileAvatarArgs = {
  avatar: Scalars['Upload']['input'];
};


export type MutationChangeProfileInfoArgs = {
  data: ChangeProfileInfoInput;
};


export type MutationCreateChatArgs = {
  data: CreateChatInput;
  groupId: Scalars['String']['input'];
};


export type MutationCreateGroupArgs = {
  data: CreateGroupInput;
};


export type MutationCreateUserWEmailArgs = {
  data: CreateUserWEmailInput;
};


export type MutationDeleteChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationDeleteGroupArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationDownloadFileArgs = {
  chatId: Scalars['String']['input'];
  fileId: Scalars['String']['input'];
};


export type MutationForwardChatMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
};


export type MutationLoginUserArgs = {
  data: LoginInput;
};


export type MutationPinChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationPinMessageArgs = {
  chatId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
};


export type MutationRefreshTokenArgs = {
  data: Scalars['String']['input'];
};


export type MutationRemoveChatAvatarArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationRemoveDraftArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationRemoveFileArgs = {
  chatId: Scalars['String']['input'];
  fileId: Scalars['String']['input'];
};


export type MutationRemoveGroupAvatarArgs = {
  groupId: Scalars['String']['input'];
};


export type MutationRemoveMessagesArgs = {
  chatId: Scalars['String']['input'];
  data: RemoveMessagesInput;
};


export type MutationSendChatDraftMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
};


export type MutationSendChatMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
};


export type MutationSendFileArgs = {
  chatId: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
  messageId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendPreKeyArgs = {
  data: PreKeyInput;
};


export type MutationSendSecretMessageArgs = {
  data: SendSecretMessageInput;
};


export type MutationSendSharedSecretKeyArgs = {
  data: SharedSecretKeyInput;
};


export type MutationUnPinChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationUnPinMessageArgs = {
  chatId: Scalars['String']['input'];
};

export type PreKeyInput = {
  ikPub: Scalars['String']['input'];
  opkPubs: Array<Scalars['String']['input']>;
  spkPub: Scalars['String']['input'];
  spkSig: Scalars['String']['input'];
};

export type PreKeyModel = {
  __typename?: 'PreKeyModel';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ikPub: Scalars['String']['output'];
  indexOpkPub: Scalars['Float']['output'];
  opkPubs: Array<Scalars['String']['output']>;
  spkPub: Scalars['String']['output'];
  spkSig: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  checkChatAccess: Scalars['Boolean']['output'];
  checkGroupAccess: Scalars['Boolean']['output'];
  findAllChatsByGroup: Array<ChatModel>;
  findAllChatsByUser: Array<ChatModel>;
  findAllGroupsByUser: Array<GroupModel>;
  findAllMessagesByChat: Array<ChatMessageModel>;
  findAllUsers: Array<UserModel>;
  findChatByChatId: ChatModel;
  findCurrentSession: SessionModel;
  findGroupByGroupId: GroupModel;
  findProfile: UserModel;
  findSessionsByUser: Array<SessionModel>;
  getPreKeys: Array<PreKeyModel>;
  getSecretMessage: QueueSecretMessageModel;
  getSharedSecretKey: Array<QueueSharedSecretKeyModel>;
};


export type QueryCheckChatAccessArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryCheckGroupAccessArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryFindAllChatsByGroupArgs = {
  filters: FiltersInput;
  groupId: Scalars['String']['input'];
};


export type QueryFindAllChatsByUserArgs = {
  filters: FiltersInput;
};


export type QueryFindAllGroupsByUserArgs = {
  filters: FiltersInput;
};


export type QueryFindAllMessagesByChatArgs = {
  chatId: Scalars['String']['input'];
  filters: FiltersInput;
};


export type QueryFindChatByChatIdArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryFindGroupByGroupIdArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetPreKeysArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetSecretMessageArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryGetSharedSecretKeyArgs = {
  chatId: Scalars['String']['input'];
};

export type QueueSecretMessageModel = {
  __typename?: 'QueueSecretMessageModel';
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  ekPub?: Maybe<Scalars['String']['output']>;
  encryptedMessage: Scalars['String']['output'];
  fromUserId: Scalars['String']['output'];
  groupId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ikPub?: Maybe<Scalars['String']['output']>;
  isKey: Scalars['Boolean']['output'];
  iv: Scalars['String']['output'];
  sig: Scalars['String']['output'];
  toUserIds: Array<Scalars['String']['output']>;
  ukm?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  usedOpk?: Maybe<Scalars['String']['output']>;
  whoCheckedIds: Array<Scalars['String']['output']>;
};

export type QueueSharedSecretKeyModel = {
  __typename?: 'QueueSharedSecretKeyModel';
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  ekPub: Scalars['String']['output'];
  encryptedKey: Scalars['String']['output'];
  fromUserId: Scalars['String']['output'];
  groupId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ikPub: Scalars['String']['output'];
  iv: Scalars['String']['output'];
  sig: Scalars['String']['output'];
  toUserId: Scalars['String']['output'];
  ukm: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usedOpk?: Maybe<Scalars['String']['output']>;
};

export type RemoveMessagesInput = {
  messageIds: Array<Scalars['String']['input']>;
};

export type SendChatMessageInput = {
  editId?: InputMaybe<Scalars['String']['input']>;
  fileIds?: InputMaybe<Array<Scalars['String']['input']>>;
  forwardedMessageIds?: InputMaybe<Array<Scalars['String']['input']>>;
  targetChatsId?: InputMaybe<Array<Scalars['String']['input']>>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type SendSecretMessageInput = {
  chatId: Scalars['String']['input'];
  encryptedMessage: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
  isKey?: InputMaybe<Scalars['Boolean']['input']>;
  iv: Scalars['String']['input'];
  sig: Scalars['String']['input'];
  toUserIds: Array<Scalars['String']['input']>;
  ukm?: InputMaybe<Scalars['String']['input']>;
};

export type SessionMetadataModel = {
  __typename?: 'SessionMetadataModel';
  device: DeviceModel;
  ip: Scalars['String']['output'];
  location: LocationModel;
};

export type SessionModel = {
  __typename?: 'SessionModel';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  metadata: SessionMetadataModel;
  userId: Scalars['String']['output'];
};

export type SharedSecretKeyInput = {
  chatId: Scalars['String']['input'];
  ekPub: Scalars['String']['input'];
  encryptedKey: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
  ikPub: Scalars['String']['input'];
  iv: Scalars['String']['input'];
  sig: Scalars['String']['input'];
  toUserId: Scalars['String']['input'];
  ukm: Scalars['String']['input'];
  usedOpk?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  addSecretMessage: QueueSecretMessageModel;
  addSharedSecretKey?: Maybe<QueueSharedSecretKeyModel>;
  chatAdded: ChatModel;
  chatDeleted: ChatModel;
  chatMessageAdded: ChatMessageModel;
  chatMessageRemoved: Array<ChatMessageIdModel>;
  chatUpdated: ChatModel;
  groupAdded: GroupModel;
  groupDeleted: GroupModel;
};


export type SubscriptionAddSecretMessageArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionAddSharedSecretKeyArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionChatAddedArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatDeletedArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatMessageAddedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatMessageRemovedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type SubscriptionChatUpdatedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionGroupAddedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionGroupDeletedArgs = {
  userId: Scalars['String']['input'];
};

export type UserModel = {
  __typename?: 'UserModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deactivatedAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDeactivated: Scalars['Boolean']['output'];
  password: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type ChatDraftMessageReplyModel = {
  __typename?: 'chatDraftMessageReplyModel';
  createdAt: Scalars['DateTime']['output'];
  draftMessage: ChatDraftMessageModel;
  draftMessageId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  repliedTo: ChatMessageModel;
  repliedToId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};
