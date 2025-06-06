"use client";

import { File as FileIcon } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import DragOverplay from "@/components/ui/elements/DragOverplay";

import {
  useExchangeKeysMutation,
  useFindChatByChatIdQuery,
  useRemoveFileMutation,
  useSendFileMutation,
} from "@/graphql/generated/output";

import { useCurrent } from "@/hooks/useCurrent";

import { encryptBytesDes } from "@/utils/crypto/des/file/encrypt-bytes-des";
import { encryptHashRsa } from "@/utils/crypto/rsa/encrypt-hash-rsa";
import generateRSAKeyPair from "@/utils/crypto/rsa/generate-rsa-key-pair";
import { sha1HashBytes } from "@/utils/crypto/sha-1/file/sha-1-hash-bytes";
import generatePrime from "@/utils/math/generate-prime";
import { isPrimitiveRoot } from "@/utils/math/is-primitive-root";
import { modPow } from "@/utils/math/mod-pow";

import ChatMessageList from "./message/list/ChatMessageList";
import SendMessageForm from "./message/send/SendMessageForm";
import { SendFileType } from "./types/send-file.type";

interface ChatProp {
  chatId: string;
}

interface ClientKeyType {
  e: bigint;
  n: bigint;
  d: bigint;
  q: bigint;
  p: bigint;
}
interface ServerKeyType {
  e: bigint;
  n: bigint;
}

interface OpenDiffieKeyType {
  g: bigint;
  p: bigint;
}

const Chat: FC<ChatProp> = ({ chatId }) => {
  const [clientKey, setClientKey] = useState<ClientKeyType | null>(null);
  const [serverKey, setServerKey] = useState<ServerKeyType | null>(null);
  const [openKeyDiffie, setOpenKeyDiffie] = useState<OpenDiffieKeyType | null>(
    null
  );
  const [secretKeyDiffie, setSecretKeyDiffie] = useState<bigint | null>(null);
  const [sessionKey, setSessionKey] = useState<bigint | null>(null);

  const [errorMessage, setErrorMessage] = useState<boolean>(false);

  const { user, isLoadingProfile } = useCurrent();

  const [files, setFiles] = useState<SendFileType[]>([]);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [isOver, setIsOver] = useState<boolean>(false);
  const [dragCounter, setDragCounter] = useState(0);

  const { data: chatData, loading: isLoadingFindChat } =
    useFindChatByChatIdQuery({
      variables: {
        chatId,
      },
    });
  const chat = chatData?.findChatByChatId;

  const [exchangeKeys, { loading: isLoadingExchange }] =
    useExchangeKeysMutation({
      onCompleted(data) {
        const sessionKeyDiffie = modPow(
          BigInt(data.exchangeKey.openKeyServerDiffie),
          secretKeyDiffie!,
          openKeyDiffie?.p!
        );

        setSessionKey(sessionKeyDiffie);

        console.log("Client Key:", clientKey);
        console.log("Server Key:", {
          e: BigInt(data.exchangeKey.publicKeyE),
          n: BigInt(data.exchangeKey.publicKeyN),
        });
        console.log("Session Key:", secretKeyDiffie);

        setServerKey({
          e: BigInt(data.exchangeKey.publicKeyE),
          n: BigInt(data.exchangeKey.publicKeyN),
        });
      },
      onError() {
        toast.error("Error exchanging keys");
      },
      fetchPolicy: "no-cache",
    });

  useEffect(() => {
    // RSA
    const { publicKey, privateKey, primes } = generateRSAKeyPair();
    setClientKey({
      e: publicKey.e,
      n: publicKey.n,
      d: privateKey.d,
      q: primes.q,
      p: primes.p,
    });

    const diffieP = generatePrime(10000n, 1000000n);
    const secretKeyDiffie = BigInt(
      Math.floor(Math.random() * Number(diffieP - 2n)) + 2
    );

    let candidate;
    do {
      candidate = BigInt(
        Math.floor(Math.random() * Number(BigInt(diffieP) - 2n)) + 2
      );
    } while (!isPrimitiveRoot(candidate, diffieP));
    const diffieG = candidate;
    const openSecretKeyDiffie = modPow(diffieG, secretKeyDiffie, diffieP);
    setOpenKeyDiffie({
      g: diffieG,
      p: diffieP,
    });
    setSecretKeyDiffie(secretKeyDiffie);

    exchangeKeys({
      variables: {
        chatId,
        data: {
          publicKeyE: publicKey.e.toString(),
          publicKeyN: publicKey.n.toString(),
          publicKeyDiffie: openSecretKeyDiffie.toString(),
          publicKeyG: diffieG.toString(),
          publicKeyP: diffieP.toString(),
        },
      },
    });
    return () => {
      setClientKey(null);
      setServerKey(null);
      setOpenKeyDiffie(null);
      setSecretKeyDiffie(null);
      setSessionKey(null);
      setFiles([]);
      setMessageId(null);
      setIsOver(false);
      setSessionKey(null);
    };
  }, [chatId, errorMessage]);

  const [send, { loading: isLoadingSendFile }] = useSendFileMutation({
    onCompleted(data) {
      setMessageId(data.sendFile.chatMessageId);

      setFiles((prevFilesId) => [
        ...prevFilesId.slice(0, -1),
        { ...prevFilesId[prevFilesId.length - 1], id: data.sendFile.fileId },
      ]);
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const [removeFile] = useRemoveFileMutation({
    onError(err) {
      toast.error("Failed to remove file: " + err.message);
    },
  });

  const handleSetErrorMessage = () => {
    setErrorMessage(!errorMessage);
  };

  const handleDelete = (id: string) => {
    setMessageId(null);
    removeFile({
      variables: {
        fileId: id,
      },
    });

    setFiles((prev) => prev.filter((file) => file.id !== id));
  };
  const handleClearFiles = () => {
    setFiles([]);
  };

  const handleClearMessageId = () => {
    setMessageId(null);
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((count) => count + 1);
    setIsOver(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((count) => {
      const newCount = count - 1;
      if (newCount <= 0) {
        setIsOver(false);
        return 0;
      }
      return newCount;
    });
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter(0);
    setIsOver(false);

    const file = e.dataTransfer.files[0];
    if (files.length < 5) {
      for (const fileState of files) {
        if (fileState.name === file.name) {
          toast.error("File with this name already exists in the chat.");
          return;
        }
      }

      setFiles((prevFiles) => [
        ...prevFiles,
        { name: file.name, size: file.size.toString(), id: null },
      ]);

      const arrayBuffer = await file.arrayBuffer();
      const byteArray: Uint8Array = new Uint8Array(arrayBuffer);

      const hashFile = await sha1HashBytes(byteArray);
      console.log("Hash of the file for server:", hashFile);

      const encryptedHashFile = encryptHashRsa(
        hashFile,
        clientKey?.d!,
        clientKey?.n!
      );

      const encryptedBytes = encryptBytesDes(
        sessionKey?.toString()!,
        byteArray
      );

      if (!encryptedBytes) {
        toast.error("Failed to encrypt the file.");
        return;
      }

      const encryptedBlob = new Blob([new Uint8Array(encryptedBytes)], {
        type: file.type,
      });

      const encryptedFile = new File([encryptedBlob], file.name, {
        type: file.type,
      });

      send({
        variables: {
          chatId,
          file: encryptedFile,
          data: {
            hashFile: encryptedHashFile,
          },
          messageId: messageId ?? "null",
        },
      });
    } else {
      toast.error("You can only upload up to 5 files at a time.");
    }
  };

  if (
    isLoadingFindChat ||
    isLoadingExchange ||
    isLoadingProfile ||
    sessionKey === null
  ) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      className="fixed mt-[75px] flex w-[50%] flex-col"
      style={{ height: "calc(100vh - 91px)" }}
    >
      <CardHeader className="border-b py-5">
        <CardTitle className="text-center text-lg">{chat?.chatName}</CardTitle>
      </CardHeader>
      <CardContent
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className="flex h-full flex-col overflow-y-auto p-4"
      >
        <>
          {sessionKey && serverKey?.e && serverKey?.n ? (
            <ChatMessageList
              chatId={chatId}
              userId={user!.id}
              sessionKey={sessionKey}
              keyE={serverKey.e}
              keyN={serverKey.n}
            />
          ) : (
            <div>Waiting for keys...</div>
          )}
          {isOver ? (
            <DragOverplay>
              <div className="flex h-full w-full items-center justify-center">
                <FileIcon className="size-15" />
                <p className="text-lg">Drop files here to upload</p>
              </div>
            </DragOverplay>
          ) : (
            <div className="">
              <SendMessageForm
                onDeleteFile={handleDelete}
                files={files}
                isLoadingSendFiles={isLoadingSendFile}
                chatId={chatId}
                keyD={clientKey?.d!}
                keyN={clientKey?.n!}
                sessionKey={sessionKey!}
                handleClearFiles={handleClearFiles}
                clearMessageId={handleClearMessageId}
                setErrorMessage={handleSetErrorMessage}
              />
            </div>
          )}
        </>
      </CardContent>
    </Card>
  );
};

export default Chat;
