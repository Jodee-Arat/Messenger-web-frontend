import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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
  chatMessageId: Scalars['String']['output'];
  fileId: Scalars['String']['output'];
};

export type AuthModel = {
  __typename?: 'AuthModel';
  message?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UserModel>;
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

export type ChatMessageModel = {
  __typename?: 'ChatMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  files?: Maybe<Array<FileMessageModel>>;
  hash: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isEdited: Scalars['Boolean']['output'];
  isFake: Scalars['Boolean']['output'];
  isStarted: Scalars['Boolean']['output'];
  readCount?: Maybe<Scalars['String']['output']>;
  replies: Array<ChatMessageModel>;
  replyTo?: Maybe<ChatMessageModel>;
  replyToId?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserModel;
  userId: Scalars['String']['output'];
};

export type ChatModel = {
  __typename?: 'ChatModel';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  chatName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isGroup: Scalars['Boolean']['output'];
  lastMessageAt?: Maybe<Scalars['DateTime']['output']>;
  members: Array<ChatMemberModel>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateChatInput = {
  chatName: Scalars['String']['input'];
  userIds: Array<Scalars['String']['input']>;
};

export type DeviceModel = {
  __typename?: 'DeviceModel';
  browser: Scalars['String']['output'];
  os: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type ExchangeKeysInput = {
  publicKeyDiffie: Scalars['String']['input'];
  publicKeyE: Scalars['String']['input'];
  publicKeyG: Scalars['String']['input'];
  publicKeyN: Scalars['String']['input'];
  publicKeyP: Scalars['String']['input'];
};

export type ExchangeKeysModel = {
  __typename?: 'ExchangeKeysModel';
  openKeyServerDiffie: Scalars['String']['output'];
  publicKeyE: Scalars['String']['output'];
  publicKeyN: Scalars['String']['output'];
};

export type FileDownloadData = {
  __typename?: 'FileDownloadData';
  base64: Scalars['String']['output'];
  filename: Scalars['String']['output'];
  hash: Array<Scalars['String']['output']>;
  mimetype: Scalars['String']['output'];
};

export type FileMessageModel = {
  __typename?: 'FileMessageModel';
  chat: ChatModel;
  chatId: Scalars['String']['output'];
  chatMessage: ChatMessageModel;
  chatMessageId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
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
  clearSessionCookie: Scalars['Boolean']['output'];
  createChat: ChatModel;
  createUserWEmail: Scalars['Boolean']['output'];
  deleteChat: Scalars['Boolean']['output'];
  downloadFile: FileDownloadData;
  exchangeKey: ExchangeKeysModel;
  loginUser: AuthModel;
  logoutUser: Scalars['Boolean']['output'];
  removeFile: Scalars['Boolean']['output'];
  removeMessages: Scalars['Boolean']['output'];
  sendChatMessage: Scalars['Boolean']['output'];
  sendFile: AttachFileModel;
};


export type MutationCreateChatArgs = {
  data: CreateChatInput;
};


export type MutationCreateUserWEmailArgs = {
  data: CreateUserWEmail;
};


export type MutationDeleteChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationDownloadFileArgs = {
  fileId: Scalars['String']['input'];
};


export type MutationExchangeKeyArgs = {
  chatId: Scalars['String']['input'];
  data: ExchangeKeysInput;
};


export type MutationLoginUserArgs = {
  data: LoginInput;
};


export type MutationRemoveFileArgs = {
  fileId: Scalars['String']['input'];
};


export type MutationRemoveMessagesArgs = {
  chatId: Scalars['String']['input'];
  data: RemoveMessagesInput;
};


export type MutationSendChatMessageArgs = {
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
};


export type MutationSendFileArgs = {
  chatId: Scalars['String']['input'];
  data: SendFileInput;
  file: Scalars['Upload']['input'];
  messageId?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  findAllChatsByUser: Array<ChatModel>;
  findAllMessagesByChat: Array<ChatMessageModel>;
  findAllUsers: Array<UserModel>;
  findChatByChatId: ChatModel;
  findCurrentSession: SessionModel;
  findProfile: UserModel;
  findSessionsByUser: Array<SessionModel>;
};


export type QueryFindAllChatsByUserArgs = {
  filters: FiltersInput;
};


export type QueryFindAllMessagesByChatArgs = {
  chatId: Scalars['String']['input'];
  filters: FiltersInput;
};


export type QueryFindChatByChatIdArgs = {
  chatId: Scalars['String']['input'];
};

export type RemoveMessagesInput = {
  messageIds: Array<Scalars['String']['input']>;
};

export type SendChatMessageInput = {
  fileIds: Array<Scalars['String']['input']>;
  hash?: InputMaybe<Array<Scalars['String']['input']>>;
  isFake: Scalars['Boolean']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
};

export type SendFileInput = {
  hashFile: Array<Scalars['String']['input']>;
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

export type Subscription = {
  __typename?: 'Subscription';
  chatAdded: ChatModel;
  chatMessageAdded: ChatMessageModel;
};


export type SubscriptionChatAddedArgs = {
  userId: Scalars['String']['input'];
};


export type SubscriptionChatMessageAddedArgs = {
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type UserModel = {
  __typename?: 'UserModel';
  createdAt: Scalars['DateTime']['output'];
  deactivatedAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDeactivated: Scalars['Boolean']['output'];
  password: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type CreateUserWEmail = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type CreateUserWEmailMutationVariables = Exact<{
  data: CreateUserWEmail;
}>;


export type CreateUserWEmailMutation = { __typename?: 'Mutation', createUserWEmail: boolean };

export type LoginUserMutationVariables = Exact<{
  data: LoginInput;
}>;


export type LoginUserMutation = { __typename?: 'Mutation', loginUser: { __typename?: 'AuthModel', message?: string | null, user?: { __typename?: 'UserModel', username: string, email: string } | null } };

export type LogoutUserMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutUserMutation = { __typename?: 'Mutation', logoutUser: boolean };

export type CreateChatMutationVariables = Exact<{
  data: CreateChatInput;
}>;


export type CreateChatMutation = { __typename?: 'Mutation', createChat: { __typename?: 'ChatModel', chatName?: string | null, id: string } };

export type DeleteChatMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type DeleteChatMutation = { __typename?: 'Mutation', deleteChat: boolean };

export type DownloadFileMutationVariables = Exact<{
  fileId: Scalars['String']['input'];
}>;


export type DownloadFileMutation = { __typename?: 'Mutation', downloadFile: { __typename?: 'FileDownloadData', base64: string, filename: string, hash: Array<string>, mimetype: string } };

export type RemoveFileMutationVariables = Exact<{
  fileId: Scalars['String']['input'];
}>;


export type RemoveFileMutation = { __typename?: 'Mutation', removeFile: boolean };

export type RemoveMessagesMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: RemoveMessagesInput;
}>;


export type RemoveMessagesMutation = { __typename?: 'Mutation', removeMessages: boolean };

export type SendChatMessageMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  data: SendChatMessageInput;
}>;


export type SendChatMessageMutation = { __typename?: 'Mutation', sendChatMessage: boolean };

export type SendFileMutationVariables = Exact<{
  chatId: Scalars['String']['input'];
  file: Scalars['Upload']['input'];
  data: SendFileInput;
  messageId: Scalars['String']['input'];
}>;


export type SendFileMutation = { __typename?: 'Mutation', sendFile: { __typename?: 'AttachFileModel', chatMessageId: string, fileId: string } };

export type ExchangeKeysMutationVariables = Exact<{
  data: ExchangeKeysInput;
  chatId: Scalars['String']['input'];
}>;


export type ExchangeKeysMutation = { __typename?: 'Mutation', exchangeKey: { __typename?: 'ExchangeKeysModel', openKeyServerDiffie: string, publicKeyE: string, publicKeyN: string } };

export type FindAllChatsByUserQueryVariables = Exact<{
  filters: FiltersInput;
}>;


export type FindAllChatsByUserQuery = { __typename?: 'Query', findAllChatsByUser: Array<{ __typename?: 'ChatModel', chatName?: string | null, id: string }> };

export type FindAllMessagesByChatQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
  filters: FiltersInput;
}>;


export type FindAllMessagesByChatQuery = { __typename?: 'Query', findAllMessagesByChat: Array<{ __typename?: 'ChatMessageModel', id: string, hash: Array<string>, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, chat: { __typename?: 'ChatModel', chatName?: string | null }, user: { __typename?: 'UserModel', id: string, username: string } }> };

export type FindChatByChatIdQueryVariables = Exact<{
  chatId: Scalars['String']['input'];
}>;


export type FindChatByChatIdQuery = { __typename?: 'Query', findChatByChatId: { __typename?: 'ChatModel', chatName?: string | null } };

export type FindAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type FindAllUsersQuery = { __typename?: 'Query', findAllUsers: Array<{ __typename?: 'UserModel', username: string, id: string }> };

export type FindProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type FindProfileQuery = { __typename?: 'Query', findProfile: { __typename?: 'UserModel', id: string, username: string, password: string } };

export type ChatAddedSubscriptionVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type ChatAddedSubscription = { __typename?: 'Subscription', chatAdded: { __typename?: 'ChatModel', id: string, chatName?: string | null } };

export type ChatMessageAddedSubscriptionVariables = Exact<{
  chatId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ChatMessageAddedSubscription = { __typename?: 'Subscription', chatMessageAdded: { __typename?: 'ChatMessageModel', id: string, hash: Array<string>, text?: string | null, files?: Array<{ __typename?: 'FileMessageModel', fileName: string, fileFormat: string, fileSize: string, id: string }> | null, chat: { __typename?: 'ChatModel', chatName?: string | null }, user: { __typename?: 'UserModel', username: string, id: string } } };


export const CreateUserWEmailDocument = gql`
    mutation CreateUserWEmail($data: createUserWEmail!) {
  createUserWEmail(data: $data)
}
    `;
export type CreateUserWEmailMutationFn = Apollo.MutationFunction<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>;

/**
 * __useCreateUserWEmailMutation__
 *
 * To run a mutation, you first call `useCreateUserWEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserWEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserWEmailMutation, { data, loading, error }] = useCreateUserWEmailMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateUserWEmailMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>(CreateUserWEmailDocument, options);
      }
export type CreateUserWEmailMutationHookResult = ReturnType<typeof useCreateUserWEmailMutation>;
export type CreateUserWEmailMutationResult = Apollo.MutationResult<CreateUserWEmailMutation>;
export type CreateUserWEmailMutationOptions = Apollo.BaseMutationOptions<CreateUserWEmailMutation, CreateUserWEmailMutationVariables>;
export const LoginUserDocument = gql`
    mutation LoginUser($data: LoginInput!) {
  loginUser(data: $data) {
    user {
      username
      email
    }
    message
  }
}
    `;
export type LoginUserMutationFn = Apollo.MutationFunction<LoginUserMutation, LoginUserMutationVariables>;

/**
 * __useLoginUserMutation__
 *
 * To run a mutation, you first call `useLoginUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginUserMutation, { data, loading, error }] = useLoginUserMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useLoginUserMutation(baseOptions?: Apollo.MutationHookOptions<LoginUserMutation, LoginUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginUserMutation, LoginUserMutationVariables>(LoginUserDocument, options);
      }
export type LoginUserMutationHookResult = ReturnType<typeof useLoginUserMutation>;
export type LoginUserMutationResult = Apollo.MutationResult<LoginUserMutation>;
export type LoginUserMutationOptions = Apollo.BaseMutationOptions<LoginUserMutation, LoginUserMutationVariables>;
export const LogoutUserDocument = gql`
    mutation LogoutUser {
  logoutUser
}
    `;
export type LogoutUserMutationFn = Apollo.MutationFunction<LogoutUserMutation, LogoutUserMutationVariables>;

/**
 * __useLogoutUserMutation__
 *
 * To run a mutation, you first call `useLogoutUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutUserMutation, { data, loading, error }] = useLogoutUserMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutUserMutation(baseOptions?: Apollo.MutationHookOptions<LogoutUserMutation, LogoutUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutUserMutation, LogoutUserMutationVariables>(LogoutUserDocument, options);
      }
export type LogoutUserMutationHookResult = ReturnType<typeof useLogoutUserMutation>;
export type LogoutUserMutationResult = Apollo.MutationResult<LogoutUserMutation>;
export type LogoutUserMutationOptions = Apollo.BaseMutationOptions<LogoutUserMutation, LogoutUserMutationVariables>;
export const CreateChatDocument = gql`
    mutation createChat($data: CreateChatInput!) {
  createChat(data: $data) {
    chatName
    id
  }
}
    `;
export type CreateChatMutationFn = Apollo.MutationFunction<CreateChatMutation, CreateChatMutationVariables>;

/**
 * __useCreateChatMutation__
 *
 * To run a mutation, you first call `useCreateChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createChatMutation, { data, loading, error }] = useCreateChatMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateChatMutation(baseOptions?: Apollo.MutationHookOptions<CreateChatMutation, CreateChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateChatMutation, CreateChatMutationVariables>(CreateChatDocument, options);
      }
export type CreateChatMutationHookResult = ReturnType<typeof useCreateChatMutation>;
export type CreateChatMutationResult = Apollo.MutationResult<CreateChatMutation>;
export type CreateChatMutationOptions = Apollo.BaseMutationOptions<CreateChatMutation, CreateChatMutationVariables>;
export const DeleteChatDocument = gql`
    mutation DeleteChat($chatId: String!) {
  deleteChat(chatId: $chatId)
}
    `;
export type DeleteChatMutationFn = Apollo.MutationFunction<DeleteChatMutation, DeleteChatMutationVariables>;

/**
 * __useDeleteChatMutation__
 *
 * To run a mutation, you first call `useDeleteChatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChatMutation, { data, loading, error }] = useDeleteChatMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useDeleteChatMutation(baseOptions?: Apollo.MutationHookOptions<DeleteChatMutation, DeleteChatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteChatMutation, DeleteChatMutationVariables>(DeleteChatDocument, options);
      }
export type DeleteChatMutationHookResult = ReturnType<typeof useDeleteChatMutation>;
export type DeleteChatMutationResult = Apollo.MutationResult<DeleteChatMutation>;
export type DeleteChatMutationOptions = Apollo.BaseMutationOptions<DeleteChatMutation, DeleteChatMutationVariables>;
export const DownloadFileDocument = gql`
    mutation DownloadFile($fileId: String!) {
  downloadFile(fileId: $fileId) {
    base64
    filename
    hash
    mimetype
  }
}
    `;
export type DownloadFileMutationFn = Apollo.MutationFunction<DownloadFileMutation, DownloadFileMutationVariables>;

/**
 * __useDownloadFileMutation__
 *
 * To run a mutation, you first call `useDownloadFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDownloadFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [downloadFileMutation, { data, loading, error }] = useDownloadFileMutation({
 *   variables: {
 *      fileId: // value for 'fileId'
 *   },
 * });
 */
export function useDownloadFileMutation(baseOptions?: Apollo.MutationHookOptions<DownloadFileMutation, DownloadFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DownloadFileMutation, DownloadFileMutationVariables>(DownloadFileDocument, options);
      }
export type DownloadFileMutationHookResult = ReturnType<typeof useDownloadFileMutation>;
export type DownloadFileMutationResult = Apollo.MutationResult<DownloadFileMutation>;
export type DownloadFileMutationOptions = Apollo.BaseMutationOptions<DownloadFileMutation, DownloadFileMutationVariables>;
export const RemoveFileDocument = gql`
    mutation RemoveFile($fileId: String!) {
  removeFile(fileId: $fileId)
}
    `;
export type RemoveFileMutationFn = Apollo.MutationFunction<RemoveFileMutation, RemoveFileMutationVariables>;

/**
 * __useRemoveFileMutation__
 *
 * To run a mutation, you first call `useRemoveFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFileMutation, { data, loading, error }] = useRemoveFileMutation({
 *   variables: {
 *      fileId: // value for 'fileId'
 *   },
 * });
 */
export function useRemoveFileMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFileMutation, RemoveFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFileMutation, RemoveFileMutationVariables>(RemoveFileDocument, options);
      }
export type RemoveFileMutationHookResult = ReturnType<typeof useRemoveFileMutation>;
export type RemoveFileMutationResult = Apollo.MutationResult<RemoveFileMutation>;
export type RemoveFileMutationOptions = Apollo.BaseMutationOptions<RemoveFileMutation, RemoveFileMutationVariables>;
export const RemoveMessagesDocument = gql`
    mutation RemoveMessages($chatId: String!, $data: RemoveMessagesInput!) {
  removeMessages(chatId: $chatId, data: $data)
}
    `;
export type RemoveMessagesMutationFn = Apollo.MutationFunction<RemoveMessagesMutation, RemoveMessagesMutationVariables>;

/**
 * __useRemoveMessagesMutation__
 *
 * To run a mutation, you first call `useRemoveMessagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMessagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMessagesMutation, { data, loading, error }] = useRemoveMessagesMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useRemoveMessagesMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMessagesMutation, RemoveMessagesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMessagesMutation, RemoveMessagesMutationVariables>(RemoveMessagesDocument, options);
      }
export type RemoveMessagesMutationHookResult = ReturnType<typeof useRemoveMessagesMutation>;
export type RemoveMessagesMutationResult = Apollo.MutationResult<RemoveMessagesMutation>;
export type RemoveMessagesMutationOptions = Apollo.BaseMutationOptions<RemoveMessagesMutation, RemoveMessagesMutationVariables>;
export const SendChatMessageDocument = gql`
    mutation SendChatMessage($chatId: String!, $data: SendChatMessageInput!) {
  sendChatMessage(chatId: $chatId, data: $data)
}
    `;
export type SendChatMessageMutationFn = Apollo.MutationFunction<SendChatMessageMutation, SendChatMessageMutationVariables>;

/**
 * __useSendChatMessageMutation__
 *
 * To run a mutation, you first call `useSendChatMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendChatMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendChatMessageMutation, { data, loading, error }] = useSendChatMessageMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSendChatMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendChatMessageMutation, SendChatMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendChatMessageMutation, SendChatMessageMutationVariables>(SendChatMessageDocument, options);
      }
export type SendChatMessageMutationHookResult = ReturnType<typeof useSendChatMessageMutation>;
export type SendChatMessageMutationResult = Apollo.MutationResult<SendChatMessageMutation>;
export type SendChatMessageMutationOptions = Apollo.BaseMutationOptions<SendChatMessageMutation, SendChatMessageMutationVariables>;
export const SendFileDocument = gql`
    mutation SendFile($chatId: String!, $file: Upload!, $data: SendFileInput!, $messageId: String!) {
  sendFile(chatId: $chatId, file: $file, data: $data, messageId: $messageId) {
    chatMessageId
    fileId
  }
}
    `;
export type SendFileMutationFn = Apollo.MutationFunction<SendFileMutation, SendFileMutationVariables>;

/**
 * __useSendFileMutation__
 *
 * To run a mutation, you first call `useSendFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendFileMutation, { data, loading, error }] = useSendFileMutation({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      file: // value for 'file'
 *      data: // value for 'data'
 *      messageId: // value for 'messageId'
 *   },
 * });
 */
export function useSendFileMutation(baseOptions?: Apollo.MutationHookOptions<SendFileMutation, SendFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendFileMutation, SendFileMutationVariables>(SendFileDocument, options);
      }
export type SendFileMutationHookResult = ReturnType<typeof useSendFileMutation>;
export type SendFileMutationResult = Apollo.MutationResult<SendFileMutation>;
export type SendFileMutationOptions = Apollo.BaseMutationOptions<SendFileMutation, SendFileMutationVariables>;
export const ExchangeKeysDocument = gql`
    mutation ExchangeKeys($data: ExchangeKeysInput!, $chatId: String!) {
  exchangeKey(chatId: $chatId, data: $data) {
    openKeyServerDiffie
    publicKeyE
    publicKeyN
  }
}
    `;
export type ExchangeKeysMutationFn = Apollo.MutationFunction<ExchangeKeysMutation, ExchangeKeysMutationVariables>;

/**
 * __useExchangeKeysMutation__
 *
 * To run a mutation, you first call `useExchangeKeysMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExchangeKeysMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [exchangeKeysMutation, { data, loading, error }] = useExchangeKeysMutation({
 *   variables: {
 *      data: // value for 'data'
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useExchangeKeysMutation(baseOptions?: Apollo.MutationHookOptions<ExchangeKeysMutation, ExchangeKeysMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExchangeKeysMutation, ExchangeKeysMutationVariables>(ExchangeKeysDocument, options);
      }
export type ExchangeKeysMutationHookResult = ReturnType<typeof useExchangeKeysMutation>;
export type ExchangeKeysMutationResult = Apollo.MutationResult<ExchangeKeysMutation>;
export type ExchangeKeysMutationOptions = Apollo.BaseMutationOptions<ExchangeKeysMutation, ExchangeKeysMutationVariables>;
export const FindAllChatsByUserDocument = gql`
    query FindAllChatsByUser($filters: FiltersInput!) {
  findAllChatsByUser(filters: $filters) {
    chatName
    id
  }
}
    `;

/**
 * __useFindAllChatsByUserQuery__
 *
 * To run a query within a React component, call `useFindAllChatsByUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllChatsByUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllChatsByUserQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useFindAllChatsByUserQuery(baseOptions: Apollo.QueryHookOptions<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables> & ({ variables: FindAllChatsByUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>(FindAllChatsByUserDocument, options);
      }
export function useFindAllChatsByUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>(FindAllChatsByUserDocument, options);
        }
export function useFindAllChatsByUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>(FindAllChatsByUserDocument, options);
        }
export type FindAllChatsByUserQueryHookResult = ReturnType<typeof useFindAllChatsByUserQuery>;
export type FindAllChatsByUserLazyQueryHookResult = ReturnType<typeof useFindAllChatsByUserLazyQuery>;
export type FindAllChatsByUserSuspenseQueryHookResult = ReturnType<typeof useFindAllChatsByUserSuspenseQuery>;
export type FindAllChatsByUserQueryResult = Apollo.QueryResult<FindAllChatsByUserQuery, FindAllChatsByUserQueryVariables>;
export const FindAllMessagesByChatDocument = gql`
    query FindAllMessagesByChat($chatId: String!, $filters: FiltersInput!) {
  findAllMessagesByChat(chatId: $chatId, filters: $filters) {
    id
    hash
    text
    files {
      fileName
      fileFormat
      fileSize
      id
    }
    chat {
      chatName
    }
    user {
      id
      username
    }
  }
}
    `;

/**
 * __useFindAllMessagesByChatQuery__
 *
 * To run a query within a React component, call `useFindAllMessagesByChatQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllMessagesByChatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllMessagesByChatQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useFindAllMessagesByChatQuery(baseOptions: Apollo.QueryHookOptions<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables> & ({ variables: FindAllMessagesByChatQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>(FindAllMessagesByChatDocument, options);
      }
export function useFindAllMessagesByChatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>(FindAllMessagesByChatDocument, options);
        }
export function useFindAllMessagesByChatSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>(FindAllMessagesByChatDocument, options);
        }
export type FindAllMessagesByChatQueryHookResult = ReturnType<typeof useFindAllMessagesByChatQuery>;
export type FindAllMessagesByChatLazyQueryHookResult = ReturnType<typeof useFindAllMessagesByChatLazyQuery>;
export type FindAllMessagesByChatSuspenseQueryHookResult = ReturnType<typeof useFindAllMessagesByChatSuspenseQuery>;
export type FindAllMessagesByChatQueryResult = Apollo.QueryResult<FindAllMessagesByChatQuery, FindAllMessagesByChatQueryVariables>;
export const FindChatByChatIdDocument = gql`
    query FindChatByChatId($chatId: String!) {
  findChatByChatId(chatId: $chatId) {
    chatName
  }
}
    `;

/**
 * __useFindChatByChatIdQuery__
 *
 * To run a query within a React component, call `useFindChatByChatIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindChatByChatIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindChatByChatIdQuery({
 *   variables: {
 *      chatId: // value for 'chatId'
 *   },
 * });
 */
export function useFindChatByChatIdQuery(baseOptions: Apollo.QueryHookOptions<FindChatByChatIdQuery, FindChatByChatIdQueryVariables> & ({ variables: FindChatByChatIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>(FindChatByChatIdDocument, options);
      }
export function useFindChatByChatIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>(FindChatByChatIdDocument, options);
        }
export function useFindChatByChatIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>(FindChatByChatIdDocument, options);
        }
export type FindChatByChatIdQueryHookResult = ReturnType<typeof useFindChatByChatIdQuery>;
export type FindChatByChatIdLazyQueryHookResult = ReturnType<typeof useFindChatByChatIdLazyQuery>;
export type FindChatByChatIdSuspenseQueryHookResult = ReturnType<typeof useFindChatByChatIdSuspenseQuery>;
export type FindChatByChatIdQueryResult = Apollo.QueryResult<FindChatByChatIdQuery, FindChatByChatIdQueryVariables>;
export const FindAllUsersDocument = gql`
    query FindAllUsers {
  findAllUsers {
    username
    id
  }
}
    `;

/**
 * __useFindAllUsersQuery__
 *
 * To run a query within a React component, call `useFindAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAllUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindAllUsersQuery(baseOptions?: Apollo.QueryHookOptions<FindAllUsersQuery, FindAllUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAllUsersQuery, FindAllUsersQueryVariables>(FindAllUsersDocument, options);
      }
export function useFindAllUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAllUsersQuery, FindAllUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAllUsersQuery, FindAllUsersQueryVariables>(FindAllUsersDocument, options);
        }
export function useFindAllUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAllUsersQuery, FindAllUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAllUsersQuery, FindAllUsersQueryVariables>(FindAllUsersDocument, options);
        }
export type FindAllUsersQueryHookResult = ReturnType<typeof useFindAllUsersQuery>;
export type FindAllUsersLazyQueryHookResult = ReturnType<typeof useFindAllUsersLazyQuery>;
export type FindAllUsersSuspenseQueryHookResult = ReturnType<typeof useFindAllUsersSuspenseQuery>;
export type FindAllUsersQueryResult = Apollo.QueryResult<FindAllUsersQuery, FindAllUsersQueryVariables>;
export const FindProfileDocument = gql`
    query FindProfile {
  findProfile {
    id
    username
    password
  }
}
    `;

/**
 * __useFindProfileQuery__
 *
 * To run a query within a React component, call `useFindProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindProfileQuery(baseOptions?: Apollo.QueryHookOptions<FindProfileQuery, FindProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindProfileQuery, FindProfileQueryVariables>(FindProfileDocument, options);
      }
export function useFindProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindProfileQuery, FindProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindProfileQuery, FindProfileQueryVariables>(FindProfileDocument, options);
        }
export function useFindProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindProfileQuery, FindProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindProfileQuery, FindProfileQueryVariables>(FindProfileDocument, options);
        }
export type FindProfileQueryHookResult = ReturnType<typeof useFindProfileQuery>;
export type FindProfileLazyQueryHookResult = ReturnType<typeof useFindProfileLazyQuery>;
export type FindProfileSuspenseQueryHookResult = ReturnType<typeof useFindProfileSuspenseQuery>;
export type FindProfileQueryResult = Apollo.QueryResult<FindProfileQuery, FindProfileQueryVariables>;
export const ChatAddedDocument = gql`
    subscription ChatAdded($userId: String!) {
  chatAdded(userId: $userId) {
    id
    chatName
  }
}
    `;

/**
 * __useChatAddedSubscription__
 *
 * To run a query within a React component, call `useChatAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatAddedSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChatAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatAddedSubscription, ChatAddedSubscriptionVariables> & ({ variables: ChatAddedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatAddedSubscription, ChatAddedSubscriptionVariables>(ChatAddedDocument, options);
      }
export type ChatAddedSubscriptionHookResult = ReturnType<typeof useChatAddedSubscription>;
export type ChatAddedSubscriptionResult = Apollo.SubscriptionResult<ChatAddedSubscription>;
export const ChatMessageAddedDocument = gql`
    subscription ChatMessageAdded($chatId: String!, $userId: String!) {
  chatMessageAdded(chatId: $chatId, userId: $userId) {
    id
    files {
      fileName
      fileFormat
      fileSize
      id
    }
    hash
    text
    chat {
      chatName
    }
    user {
      username
      id
    }
  }
}
    `;

/**
 * __useChatMessageAddedSubscription__
 *
 * To run a query within a React component, call `useChatMessageAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useChatMessageAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatMessageAddedSubscription({
 *   variables: {
 *      chatId: // value for 'chatId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChatMessageAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<ChatMessageAddedSubscription, ChatMessageAddedSubscriptionVariables> & ({ variables: ChatMessageAddedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ChatMessageAddedSubscription, ChatMessageAddedSubscriptionVariables>(ChatMessageAddedDocument, options);
      }
export type ChatMessageAddedSubscriptionHookResult = ReturnType<typeof useChatMessageAddedSubscription>;
export type ChatMessageAddedSubscriptionResult = Apollo.SubscriptionResult<ChatMessageAddedSubscription>;