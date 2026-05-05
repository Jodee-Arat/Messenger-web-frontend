"use client";

import {
  Download,
  FileIcon,
  ImageIcon,
  Loader2,
  LockKeyhole,
  Paperclip,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/common/Alert";
import { Button } from "@/components/ui/common/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/common/Card";
import { Textarea } from "@/components/ui/common/Textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/common/Dialog";
import EmptyStateCard from "@/components/ui/elements/EmptyStateCard";
import DragAndDropWrapper from "@/components/ui/elements/DragAndDropWrapper";

import {
  GetSecretSessionPreKeysQuery,
  GetSessionSecretMessagesQuery,
  GetSessionSharedSecretKeysQuery,
  useAckSessionSecretMessagesMutation,
  useAckSessionSharedSecretKeysMutation,
  useAddSessionSecretMessageSubscription,
  useAddSessionSharedSecretKeySubscription,
  useCreateSavedSecretPairingMutation,
  useDownloadSecretAttachmentMutation,
  useFindOrCreateSavedSecretChatQuery,
  useGetSecretSessionPreKeysLazyQuery,
  useGetSessionSecretMessagesLazyQuery,
  useGetSessionSharedSecretKeysLazyQuery,
  useSendSessionSecretMessageMutation,
  useUploadSecretAttachmentMutation,
} from "@/shared/graphql/generated/output";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useWebSecretSession } from "@/shared/hooks/useWebSecretSession";
import {
  buildSessionMsgEnvelope,
  decryptKuz,
  decryptSessionMsgEnvelope,
  finalizeSessionX3DH,
  fromHex,
  generateKuznechikKey,
  importPrivateRaw,
  importPublicRaw,
  toHex,
  verifyBytes,
  encryptKuz,
} from "@/shared/libs/secret/gost";
import {
  getSavedSecretMessagesFromMemory,
  getSavedSecretLocalAttachmentUrl,
  patchWebSecretSession,
  SavedSecretMessageMemory,
  setSavedSecretLocalAttachmentUrl,
  upsertSavedSecretMessageInMemory,
} from "@/shared/libs/secret/secret-session-memory";
import { downloadFile } from "@/shared/utils/download-file";
import { getGraphQLErrorMessage } from "@/shared/utils/direct-contact-blocked";

type SecretSessionPreKeyRecord =
  GetSecretSessionPreKeysQuery["getSecretSessionPreKeys"][number];
type SessionSharedSecretKeyRecord =
  GetSessionSharedSecretKeysQuery["getSessionSharedSecretKeys"][number];
type SessionSecretMessageRecord =
  GetSessionSecretMessagesQuery["getSessionSecretMessages"][number];

const sortNewestFirst = <T extends { createdAt: string }>(left: T, right: T) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

const SECRET_MESSAGE_PAYLOAD_KIND = "secret-message-v2";
const LOCAL_SAVED_ATTACHMENT_PREFIX = "local-web:";
const MAX_SAVED_ATTACHMENTS = 7;
let lastLocalSavedMessageTimestamp = 0;

type SecretAttachmentPayload = {
  attachmentId: string;
  fileName: string;
  fileFormat: string;
  fileSize: string;
  fileKeyHex: string;
  ivHex: string;
  ciphertextSize: string;
};

type SecretMessagePayloadV2 = {
  kind: typeof SECRET_MESSAGE_PAYLOAD_KIND;
  version: 2;
  text: string;
  attachments: SecretAttachmentPayload[];
};

type SelectedSavedFile = {
  id: string;
  file: File;
  previewUrl: string;
  status: "idle" | "encrypting" | "uploading" | "uploaded" | "failed";
  errorMessage?: string;
};

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
];

const isImageFile = (format: string) =>
  IMAGE_EXTENSIONS.includes(format.toLowerCase());

const isBrowserPreviewableImageFile = (format: string, mimeType?: string) =>
  isImageFile(format) && mimeType !== "image/heic" && mimeType !== "image/heif";

const getFileFormatFromName = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() || "file";

const getImageMimeType = (format: string) => {
  const normalized = format.toLowerCase();

  if (normalized === "jpg") return "image/jpeg";
  if (normalized === "svg") return "image/svg+xml";
  if (!isImageFile(normalized)) return "application/octet-stream";

  return `image/${normalized}`;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  const chunkSize = 8192;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value.replace(/\s+/g, ""));
  const output = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index);
  }

  return output;
};

const parseSecretMessageContent = (
  plaintext: string,
): {
  text: string;
  attachments: SecretAttachmentPayload[];
} => {
  try {
    const parsed = JSON.parse(plaintext) as Partial<SecretMessagePayloadV2>;

    if (
      parsed.kind !== SECRET_MESSAGE_PAYLOAD_KIND ||
      parsed.version !== 2 ||
      !Array.isArray(parsed.attachments)
    ) {
      return { text: plaintext, attachments: [] };
    }

    const attachments = parsed.attachments.filter(
      (attachment) =>
        typeof attachment?.attachmentId === "string" &&
        typeof attachment?.fileName === "string" &&
        typeof attachment?.fileFormat === "string" &&
        typeof attachment?.fileSize === "string" &&
        typeof attachment?.fileKeyHex === "string" &&
        typeof attachment?.ivHex === "string" &&
        typeof attachment?.ciphertextSize === "string",
    ) as SecretAttachmentPayload[];

    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      attachments,
    };
  } catch {
    return { text: plaintext, attachments: [] };
  }
};

const buildSecretMessagePlaintext = (
  text: string,
  attachments: SecretAttachmentPayload[],
) => {
  if (attachments.length === 0) {
    return text;
  }

  const payload: SecretMessagePayloadV2 = {
    kind: SECRET_MESSAGE_PAYLOAD_KIND,
    version: 2,
    text,
    attachments,
  };

  return JSON.stringify(payload);
};

const getNextLocalSavedMessageTimestamp = () => {
  const now = Date.now();
  const nextTimestamp =
    now <= lastLocalSavedMessageTimestamp
      ? lastLocalSavedMessageTimestamp + 1
      : now;

  lastLocalSavedMessageTimestamp = nextTimestamp;
  return nextTimestamp;
};

const SavedSecretAttachmentPreview = ({
  attachment,
  chatId,
}: {
  attachment: SecretAttachmentPayload;
  chatId: string;
}) => {
  const tMessages = useTranslations("messages");
  const {
    attachmentId,
    ciphertextSize,
    fileFormat,
    fileKeyHex,
    fileName,
    ivHex,
  } = attachment;
  const [downloadSecretAttachment, { loading }] =
    useDownloadSecretAttachmentMutation();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const localFileUrl = getSavedSecretLocalAttachmentUrl(attachmentId);

  const loadAttachmentUrl = useCallback(async () => {
    if (fileUrl) return fileUrl;

    if (attachmentId.startsWith(LOCAL_SAVED_ATTACHMENT_PREFIX)) {
      setFileUrl(localFileUrl);
      return localFileUrl;
    }

    const response = await downloadSecretAttachment({
      variables: {
        chatId,
        attachmentId,
      },
    });
    const payload = response.data?.downloadSecretAttachment;
    if (!payload) return null;

    const decryptedBytes = await decryptKuz(
      fromHex(fileKeyHex),
      fromHex(ivHex),
      base64ToBytes(payload.ciphertextBase64),
    );
    const blob = new Blob([decryptedBytes], {
      type: getImageMimeType(fileFormat),
    });
    const objectUrl = URL.createObjectURL(blob);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = objectUrl;
    setFileUrl(objectUrl);

    return objectUrl;
  }, [
    attachmentId,
    chatId,
    downloadSecretAttachment,
    fileFormat,
    fileKeyHex,
    fileUrl,
    ivHex,
    localFileUrl,
  ]);

  useEffect(() => {
    if (!isImageFile(fileFormat)) return;

    let isMounted = true;

    const loadImage = async () => {
      try {
        await loadAttachmentUrl();
      } catch {
        if (isMounted) {
          setFileUrl(null);
        }
      }
    };

    void loadImage();

    return () => {
      isMounted = false;
    };
  }, [ciphertextSize, fileFormat, loadAttachmentUrl]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    [],
  );

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const nextFileUrl = await loadAttachmentUrl();
      if (!nextFileUrl) {
        throw new Error("Attachment is not available");
      }
      await downloadFile(nextFileUrl, fileName);
    } catch {
      toast.error(tMessages("fileDownloadError"));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isImageFile(fileFormat)) {
    return (
      <button
        type="button"
        className="mt-2 flex max-w-full items-center gap-2 rounded-xl bg-primary-foreground/10 px-3 py-2 text-left text-xs text-primary-foreground/90 transition hover:bg-primary-foreground/15"
        onClick={handleDownload}
        disabled={isDownloading || loading}
      >
        {isDownloading || loading ? (
          <Loader2 className="size-4 shrink-0 animate-spin" />
        ) : (
          <FileIcon className="size-4 shrink-0" />
        )}
        <span className="min-w-0 flex-1 truncate">{fileName}</span>
        <Download className="size-4 shrink-0 opacity-80" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="mt-2 block overflow-hidden rounded-2xl border border-white/10 bg-primary-foreground/5 text-left"
        onClick={() => fileUrl && setIsViewerOpen(true)}
        disabled={!fileUrl}
      >
        {fileUrl ? (
          <img
            src={fileUrl}
            alt={fileName}
            className="aspect-square w-56 object-cover sm:w-72"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-square w-56 flex-col items-center justify-center gap-2 px-4 text-center text-primary-foreground/80 sm:w-72">
            {loading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <ImageIcon className="size-8" />
            )}
            <span className="max-w-full truncate text-xs font-medium">
              {fileName}
            </span>
          </div>
        )}
      </button>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="w-[min(96vw,72rem)] max-w-[min(96vw,72rem)] border-white/10 bg-black/95 p-3 text-white shadow-2xl [&>button]:text-white [&>button]:hover:bg-white/10 [&>button]:focus:ring-white/40">
          <DialogTitle className="sr-only">
            {tMessages("imagePreview")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {fileName}
          </DialogDescription>

          <div className="flex max-h-[82vh] items-center justify-center overflow-hidden rounded-xl bg-black/80">
            {fileUrl ? (
              <img
                src={fileUrl}
                alt={fileName}
                className="max-h-[82vh] w-auto max-w-full object-contain"
              />
            ) : (
              <div className="flex min-h-80 w-full items-center justify-center">
                <Loader2 className="size-7 animate-spin text-white/80" />
              </div>
            )}
          </div>

          <div className="flex justify-center pt-1">
            <Button
              type="button"
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={handleDownload}
              disabled={!fileUrl || isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {tMessages("downloadImage")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const SavedSecretChat = () => {
  const t = useTranslations("saved");
  const tCommon = useTranslations("common");
  const { user, isLoadingProfile } = useCurrentUser();
  const {
    session,
    isLoading: isLoadingSession,
    error: sessionError,
    ensureSession,
  } = useWebSecretSession({ autoCreate: false });
  const [draft, setDraft] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedSavedFile[]>([]);
  const [messages, setMessages] = useState<SavedSecretMessageMemory[]>(
    getSavedSecretMessagesFromMemory(),
  );
  const [sessionKey, setSessionKey] = useState<Uint8Array | null>(null);
  const sessionKeyRef = useRef<Uint8Array | null>(null);
  const targetSessionIdsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedFilesRef = useRef<SelectedSavedFile[]>([]);
  const [pairingData, setPairingData] = useState<{
    pairingId: string;
    challenge: string;
    safetyCode: string;
    qrCodeUrl?: string | null;
    qrPayload?: string | null;
  } | null>(null);

  const {
    data: savedChatData,
    loading: isLoadingChat,
    error: savedChatError,
    refetch: refetchSavedChat,
  } = useFindOrCreateSavedSecretChatQuery({
    skip: !user?.id,
    fetchPolicy: "network-only",
  });
  const [createSavedSecretPairing, { loading: isCreatingPairing }] =
    useCreateSavedSecretPairingMutation();
  const [getSecretSessionPreKeys] = useGetSecretSessionPreKeysLazyQuery({
    fetchPolicy: "network-only",
  });
  const [getSessionSharedSecretKeys] = useGetSessionSharedSecretKeysLazyQuery({
    fetchPolicy: "network-only",
  });
  const [getSessionSecretMessages] = useGetSessionSecretMessagesLazyQuery({
    fetchPolicy: "network-only",
  });
  const [ackSharedSecretKeys] = useAckSessionSharedSecretKeysMutation();
  const [ackSecretMessages] = useAckSessionSecretMessagesMutation();
  const [sendSessionSecretMessage, { loading: isSendingMessage }] =
    useSendSessionSecretMessageMutation();
  const [uploadSecretAttachment] = useUploadSecretAttachmentMutation();

  const chatId = savedChatData?.findOrCreateSavedSecretChat.id ?? null;

  const syncMessagesFromMemory = useCallback(() => {
    setMessages(getSavedSecretMessagesFromMemory());
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles((current) => {
      current.forEach((file) => URL.revokeObjectURL(file.previewUrl));
      return [];
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(
    () => () => {
      selectedFilesRef.current.forEach((file) =>
        URL.revokeObjectURL(file.previewUrl),
      );
    },
    [],
  );

  const patchSelectedFile = useCallback(
    (fileId: string, patch: Partial<SelectedSavedFile>) => {
      setSelectedFiles((current) =>
        current.map((file) =>
          file.id === fileId ? { ...file, ...patch } : file,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    sessionKeyRef.current = sessionKey;
  }, [sessionKey]);

  useEffect(() => {
    targetSessionIdsRef.current = [];
  }, [chatId, session?.secretSessionId, user?.id]);

  useEffect(() => {
    if (!session || !chatId) return;

    patchWebSecretSession({ savedChatId: chatId });
  }, [chatId, session]);

  const getTargetSessionIds = useCallback(
    (bundles: SecretSessionPreKeyRecord[]) =>
      Array.from(
        new Set(
          bundles
            .filter(
              (bundle) =>
                bundle.userId === user?.id &&
                bundle.secretSessionId !== session?.secretSessionId,
            )
            .map((bundle) => bundle.secretSessionId),
        ),
      ),
    [session?.secretSessionId, user?.id],
  );

  const loadBundles = useCallback(async () => {
    if (!chatId) return [];

    const response = await getSecretSessionPreKeys({
      variables: { chatId },
    });

    const bundles = response.data?.getSecretSessionPreKeys ?? [];
    targetSessionIdsRef.current = getTargetSessionIds(bundles);

    return bundles;
  }, [chatId, getSecretSessionPreKeys, getTargetSessionIds]);

  const resolveCurrentOpkPrivateKey = useCallback(
    (
      packets: SecretSessionPreKeyRecord[],
      usedOpk: string | null | undefined,
    ) => {
      if (!session || !usedOpk) return undefined;

      const myBundle = packets.find(
        (bundle) => bundle.secretSessionId === session.secretSessionId,
      );
      if (!myBundle) return undefined;

      const opkIndex = myBundle.opkPubs.findIndex((opk) => opk === usedOpk);
      if (opkIndex < 0) return undefined;

      const rawPrivate = session.privateKeyMaterial.opkPriv[opkIndex];
      return rawPrivate ? importPrivateRaw(fromHex(rawPrivate)) : undefined;
    },
    [session],
  );

  const processSharedKeyPackets = useCallback(
    async (packets: SessionSharedSecretKeyRecord[]) => {
      if (!session || !chatId || packets.length === 0) return;

      const bundles = await loadBundles();
      const ikPriv = await importPrivateRaw(
        fromHex(session.privateKeyMaterial.ikPriv),
      );
      const spkPriv = await importPrivateRaw(
        fromHex(session.privateKeyMaterial.spkPriv),
      );

      const candidatePackets = packets
        .filter((packet) => packet.toSessionId === session.secretSessionId)
        .sort(sortNewestFirst);

      for (const packet of candidatePackets) {
        try {
          const opkPriv = await resolveCurrentOpkPrivateKey(
            bundles,
            packet.usedOpk ?? null,
          );
          const { sessionKey: pairSessionKey } = await finalizeSessionX3DH({
            bobIKPriv: ikPriv,
            bobSPKPriv: spkPriv,
            opkPriv,
            envelope: {
              ikAPub: packet.ikPub,
              ekAPub: packet.ekPub,
              usedOpk: packet.usedOpk ?? null,
              ukm: packet.ukm,
            },
          });

          const decryptedKey = await decryptKuz(
            pairSessionKey,
            fromHex(packet.iv),
            fromHex(packet.encryptedKey),
          );

          const senderIkPub =
            packet.ikPub ||
            bundles.find((bundle) => bundle.secretSessionId === packet.fromSessionId)
              ?.ikPub;

          if (senderIkPub) {
            const senderKey = await importPublicRaw(fromHex(senderIkPub));
            const aad = new Uint8Array([
              ...new TextEncoder().encode("GROUPKEYv1"),
              ...fromHex(packet.ikPub),
              ...fromHex(packet.ekPub),
            ]);

            const sigOk = await verifyBytes(
              senderKey,
              new Uint8Array([
                ...aad,
                ...fromHex(packet.iv),
                ...fromHex(packet.encryptedKey),
              ]),
              fromHex(packet.sig),
            );

            if (!sigOk) {
              continue;
            }
          }

          setSessionKey(decryptedKey);
          await ackSharedSecretKeys({
            variables: {
              chatId,
              secretSessionId: session.secretSessionId,
              sharedKeyIds: [packet.id],
            },
          });

          return;
        } catch {}
      }
    },
    [
      ackSharedSecretKeys,
      chatId,
      loadBundles,
      resolveCurrentOpkPrivateKey,
      session,
    ],
  );

  const processSecretMessages = useCallback(
    async (packets: SessionSecretMessageRecord[]) => {
      if (!chatId || !session || !sessionKeyRef.current || packets.length === 0) {
        return;
      }

      const bundles = await loadBundles();
      const processedIds: string[] = [];

      for (const packet of packets.sort((left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      )) {
        try {
          const senderIkPub =
            bundles.find(
              (bundle) => bundle.secretSessionId === packet.fromSessionId,
            )?.ikPub ??
            bundles.find((bundle) => bundle.userId === packet.fromUserId)?.ikPub;

          if (!senderIkPub) {
            continue;
          }

          const decrypted = await decryptSessionMsgEnvelope({
            sessionKey: sessionKeyRef.current,
            envelope: {
              iv: packet.iv,
              ct: packet.encryptedMessage,
              sig: packet.sig,
            },
            senderIkPub,
          });

          upsertSavedSecretMessageInMemory({
            id: packet.id,
            plaintext: decrypted.decrypted,
            direction:
              packet.fromSessionId === session.secretSessionId
                ? "outgoing"
                : "incoming",
            createdAt: new Date(packet.createdAt).getTime(),
            fromSessionId: packet.fromSessionId,
          });
          processedIds.push(packet.id);
        } catch {}
      }

      if (processedIds.length > 0) {
        syncMessagesFromMemory();
        await ackSecretMessages({
          variables: {
            chatId,
            secretSessionId: session.secretSessionId,
            messageIds: processedIds,
          },
        });
      }
    },
    [ackSecretMessages, chatId, loadBundles, session, syncMessagesFromMemory],
  );

  const refreshPendingSecretState = useCallback(async () => {
    if (!chatId || !session) return;

    const sharedResponse = await getSessionSharedSecretKeys({
      variables: {
        chatId,
        secretSessionId: session.secretSessionId,
      },
    });

    const sharedPackets = sharedResponse.data?.getSessionSharedSecretKeys ?? [];
    if (sharedPackets.length > 0) {
      await processSharedKeyPackets(sharedPackets);
    }

    if (!sessionKeyRef.current) return;

    const messagesResponse = await getSessionSecretMessages({
      variables: {
        chatId,
        secretSessionId: session.secretSessionId,
      },
    });

    const secretPackets = messagesResponse.data?.getSessionSecretMessages ?? [];
    if (secretPackets.length > 0) {
      await processSecretMessages(secretPackets);
    }
  }, [
    chatId,
    getSessionSecretMessages,
    getSessionSharedSecretKeys,
    processSecretMessages,
    processSharedKeyPackets,
    session,
  ]);

  useEffect(() => {
    if (!chatId || !session) return;

    void refreshPendingSecretState();
  }, [chatId, refreshPendingSecretState, session]);

  useAddSessionSharedSecretKeySubscription({
    variables: {
      userId: user?.id ?? "",
      secretSessionId: session?.secretSessionId ?? "",
    },
    skip: !user?.id || !session?.secretSessionId,
    onData: ({ data }) => {
      const packet = data.data?.addSessionSharedSecretKey;
      if (!packet) return;

      void processSharedKeyPackets([packet]);
    },
  });

  useAddSessionSecretMessageSubscription({
    variables: {
      userId: user?.id ?? "",
      secretSessionId: session?.secretSessionId ?? "",
    },
    skip: !user?.id || !session?.secretSessionId,
    onData: ({ data }) => {
      const packet = data.data?.addSessionSecretMessage;
      if (!packet) return;

      void processSecretMessages([packet]);
    },
  });

  const handleCreatePairing = async () => {
    try {
      const activeSession = await ensureSession();
      if (!activeSession) {
        throw new Error(t("pairingCreateFailed"));
      }

      const response = await createSavedSecretPairing({
        variables: {
          webSecretSessionId: activeSession.secretSessionId,
        },
      });

      const pairing = response.data?.createSavedSecretPairing;
      if (!pairing) {
        throw new Error(t("pairingCreateFailed"));
      }

      setPairingData({
        pairingId: pairing.pairingId,
        challenge: pairing.challenge,
        safetyCode: pairing.safetyCode,
        qrCodeUrl: pairing.qrCodeUrl,
        qrPayload: pairing.qrPayload,
      });
      toast.success(t("pairingCreated"));
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const addSelectedFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    setSelectedFiles((current) => {
      const nextFiles = [...current];

      for (const file of files) {
        if (nextFiles.length >= MAX_SAVED_ATTACHMENTS) {
          toast.error(`Можно прикрепить не больше ${MAX_SAVED_ATTACHMENTS} файлов.`);
          break;
        }

        const isDuplicate = nextFiles.some(
          (selectedFile) =>
            selectedFile.file.name === file.name &&
            selectedFile.file.size === file.size,
        );
        if (isDuplicate) {
          continue;
        }

        nextFiles.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: "idle",
        });
      }

      return nextFiles;
    });
  }, []);

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    addSelectedFiles(Array.from(event.target.files ?? []));

    event.target.value = "";
  };

  const handleDropFiles = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      addSelectedFiles(Array.from(event.dataTransfer.files ?? []));
    },
    [addSelectedFiles],
  );

  const uploadSelectedFiles = useCallback(async () => {
    if (!chatId || selectedFiles.length === 0) return [];

    const uploadedAttachments: SecretAttachmentPayload[] = [];

    for (const selectedFile of selectedFiles) {
      try {
        patchSelectedFile(selectedFile.id, {
          status: "encrypting",
          errorMessage: undefined,
        });

        const plaintextBytes = new Uint8Array(await selectedFile.file.arrayBuffer());
        const { keyBytes, keyHex } = await generateKuznechikKey();
        const encryptedFile = await encryptKuz(keyBytes, plaintextBytes);
        const ciphertextBase64 = bytesToBase64(encryptedFile.ciphertext);

        patchSelectedFile(selectedFile.id, { status: "uploading" });

        const uploadResponse = await uploadSecretAttachment({
          variables: {
            data: {
              chatId,
              ciphertextBase64,
            },
          },
        });
        const uploadedAttachment = uploadResponse.data?.uploadSecretAttachment;

        if (!uploadedAttachment?.id) {
          throw new Error("Secret attachment upload did not return an id.");
        }

        patchSelectedFile(selectedFile.id, { status: "uploaded" });

        uploadedAttachments.push({
          attachmentId: uploadedAttachment.id,
          fileName: selectedFile.file.name,
          fileFormat: getFileFormatFromName(selectedFile.file.name),
          fileSize: String(selectedFile.file.size),
          fileKeyHex: keyHex,
          ivHex: toHex(encryptedFile.iv),
          ciphertextSize:
            uploadedAttachment.ciphertextSize ||
            String(encryptedFile.ciphertext.byteLength),
        });
      } catch (error) {
        patchSelectedFile(selectedFile.id, {
          status: "failed",
          errorMessage: getGraphQLErrorMessage(error),
        });
        throw error;
      }
    }

    return uploadedAttachments;
  }, [chatId, patchSelectedFile, selectedFiles, uploadSecretAttachment]);

  const buildLocalSelectedFileAttachments = useCallback(
    () =>
      selectedFiles.map((selectedFile) => {
        const attachmentId = `${LOCAL_SAVED_ATTACHMENT_PREFIX}${crypto.randomUUID()}`;
        setSavedSecretLocalAttachmentUrl(
          attachmentId,
          URL.createObjectURL(selectedFile.file),
        );

        return {
          attachmentId,
          fileName: selectedFile.file.name,
          fileFormat: getFileFormatFromName(selectedFile.file.name),
          fileSize: String(selectedFile.file.size),
          fileKeyHex: "",
          ivHex: "",
          ciphertextSize: String(selectedFile.file.size),
        };
      }),
    [selectedFiles],
  );

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !chatId ||
      !user ||
      (!draft.trim() && selectedFiles.length === 0)
    ) {
      return;
    }

    try {
      const activeSessionKey = sessionKeyRef.current;
      let bundles: SecretSessionPreKeyRecord[] = [];
      let targetSessionIds = targetSessionIdsRef.current;

      if (activeSessionKey && targetSessionIds.length === 0) {
        bundles = await loadBundles();
        targetSessionIds = targetSessionIdsRef.current;
      }

      if (!activeSessionKey || targetSessionIds.length === 0) {
        const plaintext = buildSecretMessagePlaintext(
          draft.trim(),
          buildLocalSelectedFileAttachments(),
        );

        upsertSavedSecretMessageInMemory({
          id: `local-${crypto.randomUUID()}`,
          plaintext,
          direction: "outgoing",
          createdAt: getNextLocalSavedMessageTimestamp(),
          fromSessionId: session?.secretSessionId ?? null,
        });
        syncMessagesFromMemory();
        setDraft("");
        clearSelectedFiles();
        return;
      }

      const uploadedAttachments = await uploadSelectedFiles();
      const plaintext = buildSecretMessagePlaintext(
        draft.trim(),
        uploadedAttachments,
      );
      const signerIKPriv = await importPrivateRaw(
        fromHex(session.privateKeyMaterial.ikPriv),
      );
      const { envelope } = await buildSessionMsgEnvelope({
        sessionKey: activeSessionKey,
        plaintext,
        signerIKPriv,
      });

      const response = await sendSessionSecretMessage({
        variables: {
          data: {
            chatId,
            fromSessionId: session?.secretSessionId ?? "",
            encryptedMessage: envelope.ct,
            iv: envelope.iv,
            sig: envelope.sig,
            ukm: null,
            toUserIds: [user.id],
            toSessionIds: targetSessionIds,
            secretAttachmentIds: uploadedAttachments.map(
              (attachment) => attachment.attachmentId,
            ),
          },
        },
      });

      const sentMessage = response.data?.sendSessionSecretMessage;
      if (sentMessage) {
        upsertSavedSecretMessageInMemory({
          id: sentMessage.id,
          plaintext,
          direction: "outgoing",
          createdAt: new Date(sentMessage.createdAt).getTime(),
          fromSessionId: sentMessage.fromSessionId,
        });
        syncMessagesFromMemory();
      }

      setDraft("");
      clearSelectedFiles();
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const isLoading = isLoadingProfile || isLoadingChat;
  const loadError = sessionError || getGraphQLErrorMessage(savedChatError, "");
  const hasActivePhoneLink = !!sessionKey;
  const canCompose = !!user && !!chatId;
  const isPreparingSelectedFiles = selectedFiles.some(
    (file) => file.status === "encrypting" || file.status === "uploading",
  );
  const isSendingSavedMessage = isSendingMessage || isPreparingSelectedFiles;
  const attachFileLabel = useMemo(() => {
    try {
      return t("attachFile");
    } catch {
      return "Файл";
    }
  }, [t]);
  const canSendSavedMessage =
    canCompose &&
    !isSendingSavedMessage &&
    (draft.trim().length > 0 || selectedFiles.length > 0);
  const handleComposerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.key !== "Enter" ||
        event.shiftKey ||
        event.nativeEvent.isComposing
      ) {
        return;
      }

      event.preventDefault();
      if (!canSendSavedMessage) return;

      event.currentTarget.form?.requestSubmit();
    },
    [canSendSavedMessage],
  );
  const savedMessages = useMemo(
    () =>
      [...messages]
        .sort(
          (left, right) =>
            left.createdAt - right.createdAt ||
            left.id.localeCompare(right.id),
        )
        .map((message) => {
          const parsedContent = parseSecretMessageContent(message.plaintext);

          return {
            ...message,
            text: parsedContent.text,
            attachments: parsedContent.attachments,
            time: new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }),
    [messages],
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center">
        <Card className="w-full">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <LockKeyhole className="size-4" />
              <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => void refetchSavedChat()}>
                <RefreshCw className="mr-2 size-4" />
                {tCommon("retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DragAndDropWrapper
      drop={handleDropFiles}
      disabled={!canCompose || isSendingSavedMessage}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="scrollbar-thin flex h-full min-h-0 flex-col gap-4 overflow-y-auto pb-4 pr-1">
      <Card className="shrink-0 border-border/60 bg-card/90">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("description")}
              </p>
            </div>
            <div
              className={`flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-medium sm:self-center ${
                hasActivePhoneLink
                  ? "bg-emerald-500/12 text-emerald-400"
                  : "bg-amber-500/12 text-amber-400"
              }`}
            >
              {hasActivePhoneLink ? (
                <ShieldCheck className="size-4" />
              ) : (
                <Smartphone className="size-4" />
              )}
              {hasActivePhoneLink ? t("statusLinked") : t("statusLocal")}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shrink-0 border-border/60 bg-card/90">
        <CardHeader>
          <CardTitle className="text-base">{t("pairingTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("pairingDescription")}
          </p>

          {pairingData ? (
            <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                {pairingData.qrCodeUrl ? (
                  <img
                    src={pairingData.qrCodeUrl}
                    alt={t("pairingQrTitle")}
                    className="mx-auto size-44 rounded-xl bg-white p-2 sm:size-52"
                  />
                ) : (
                  <div className="mx-auto flex size-44 items-center justify-center rounded-xl border border-dashed border-border/70 text-center text-sm text-muted-foreground sm:size-52">
                    {t("pairingQrUnavailable")}
                  </div>
                )}
                <p className="mt-3 text-center text-sm font-semibold">
                  {t("pairingQrTitle")}
                </p>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  {t("pairingQrDescription")}
                </p>
              </div>

              <div className="grid content-start gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/40 p-3 md:col-span-2">
                  <p className="text-xs uppercase text-muted-foreground">
                    {t("safetyCodeLabel")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-[0.18em]">
                    {pairingData.safetyCode}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("pairingSafetyHint")}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    {t("pairingIdLabel")}
                  </p>
                  <p className="mt-1 break-all text-sm font-medium">
                    {pairingData.pairingId}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                  <p className="text-xs uppercase text-muted-foreground">
                    {t("challengeLabel")}
                  </p>
                  <p className="mt-1 break-all text-sm font-medium">
                    {pairingData.challenge}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/70 bg-background/30 p-4">
              <p className="text-sm text-muted-foreground">
                {t("pairingEmpty")}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCreatePairing}
              disabled={!user || isCreatingPairing || isLoadingSession}
            >
              {(isCreatingPairing || isLoadingSession) && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {t("createPairing")}
            </Button>
            <Button
              variant="outline"
              onClick={() => void refreshPendingSecretState()}
              disabled={!session || !chatId}
            >
              <RefreshCw className="mr-2 size-4" />
              {t("refreshState")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-[28rem] flex-1 flex-col border-border/60 bg-card/90">
        <CardHeader>
          <CardTitle className="text-base">{t("messagesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-border/60 bg-background/35 p-4">
            {savedMessages.length === 0 ? (
              <EmptyStateCard
                icon={ShieldCheck}
                title={t("emptyTitle")}
                description={
                  hasActivePhoneLink
                    ? t("emptyDescription")
                    : t("emptyLocalDescription")
                }
              />
            ) : (
              savedMessages.map((message) => (
                <div
                  key={message.id}
                  className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground"
                >
                  {message.text && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.text}
                    </p>
                  )}
                  {message.attachments.map((attachment) => (
                    <SavedSecretAttachmentPreview
                      key={attachment.attachmentId}
                      attachment={attachment}
                      chatId={chatId ?? ""}
                    />
                  ))}
                  <p className="mt-2 text-right text-[11px] text-primary-foreground/80">
                    {message.time}
                  </p>
                </div>
              ))
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="scrollbar-thin flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-border/60 bg-background/35 p-3">
              {selectedFiles.map((file) => {
                const fileFormat = getFileFormatFromName(file.file.name);
                const isImage = isBrowserPreviewableImageFile(
                  fileFormat,
                  file.file.type,
                );
                const isPreparing =
                  file.status === "encrypting" || file.status === "uploading";
                const statusText =
                  file.status === "encrypting"
                    ? t("fileEncrypting")
                    : file.status === "uploading"
                      ? t("fileUploading")
                      : null;

                return (
                  <div
                    key={file.id}
                    className={`group relative flex min-h-20 w-28 flex-col overflow-hidden rounded-xl border bg-background/60 ${
                      file.status === "failed"
                        ? "border-destructive/70"
                        : "border-border/60"
                    }`}
                  >
                    {isImage ? (
                      <img
                        src={file.previewUrl}
                        alt={file.file.name}
                        className="h-20 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-full items-center justify-center bg-background/60">
                        <FileIcon className="size-8 text-muted-foreground" />
                      </div>
                    )}
                    <span className="truncate px-2 py-1 text-xs text-muted-foreground">
                      {file.file.name}
                    </span>
                    {isPreparing && statusText && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/85 px-2 text-center backdrop-blur-sm">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span className="text-[11px] font-medium text-foreground">
                          {statusText}
                        </span>
                      </div>
                    )}
                    {file.status === "failed" && (
                      <div className="px-2 pb-2 text-[11px] font-medium text-destructive">
                        {file.errorMessage || t("fileFailed")}
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-90 transition hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() =>
                        setSelectedFiles((current) => {
                          const target = current.find((item) => item.id === file.id);
                          if (target) {
                            URL.revokeObjectURL(target.previewUrl);
                          }

                          return current.filter((item) => item.id !== file.id);
                        })
                      }
                      disabled={isPreparing}
                      aria-label="Remove file"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <form className="flex flex-col gap-3 xl:flex-row" onSubmit={handleSend}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleSelectFiles}
            />
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={
                hasActivePhoneLink
                  ? t("composerPlaceholder")
                  : t("composerLocalPlaceholder")
              }
              disabled={!canCompose || isSendingSavedMessage}
              className="min-h-20 w-full flex-1 resize-none"
            />
            <div className="flex shrink-0 flex-row flex-wrap gap-2 xl:w-32 xl:flex-col">
              <Button
                type="button"
                variant="outline"
                disabled={!canCompose || isSendingSavedMessage}
                onClick={() => fileInputRef.current?.click()}
                className="min-w-0 flex-1 xl:min-w-28 xl:flex-none"
                title={attachFileLabel}
              >
                <Paperclip className="size-4" />
                {attachFileLabel}
              </Button>
              <Button
                type="submit"
                disabled={!canSendSavedMessage}
                className="min-w-0 flex-1 xl:min-w-28 xl:flex-none"
              >
                {isSendingSavedMessage && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("send")}
              </Button>
              {!hasActivePhoneLink && (
                <p className="w-full text-xs text-muted-foreground xl:max-w-28">
                  {t("composerLocalHint")}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </DragAndDropWrapper>
  );
};

export default SavedSecretChat;
