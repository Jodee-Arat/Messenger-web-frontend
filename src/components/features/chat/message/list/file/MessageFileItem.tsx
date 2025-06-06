import { File } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";

import { useDownloadFileMutation } from "@/graphql/generated/output";

import { base64ToUint8Array } from "@/utils/base64-to-Uint8Array";
import { decryptBytesDes } from "@/utils/crypto/des/file/decrypt-bytes-des";
import { decryptHashRsa } from "@/utils/crypto/rsa/decrypt-hash-rsa";
import { sha1HashBytes } from "@/utils/crypto/sha-1/file/sha-1-hash-bytes";
import { downloadFile } from "@/utils/download-file";
import { formatBytes } from "@/utils/format-bytes";

import { messageType } from "../../../types/message-file.type";

interface MessageFileItemProp {
  file: messageType;
  sessionKey: bigint;
  keyE: bigint;
  keyN: bigint;
}

const MessageFileItem: FC<MessageFileItemProp> = ({
  file,
  keyE,
  keyN,
  sessionKey,
}) => {
  const [download, { loading: isLoadingDownload }] = useDownloadFileMutation({
    onCompleted: async (data) => {
      if (data.downloadFile) {
        const { base64, filename, hash, mimetype } = data.downloadFile;

        const encryptedBytes = base64ToUint8Array(base64);
        const decryptedBytes = decryptBytesDes(
          sessionKey.toString(),
          new Uint8Array(encryptedBytes)
        );
        if (!decryptBytesDes) {
          toast.error("Failed to decrypt file.");
          return;
        }
        const hashDecryptedBytes = await sha1HashBytes(decryptedBytes!);

        const decryptedHash = decryptHashRsa(hash, keyE, keyN);

        if (hashDecryptedBytes !== decryptedHash) {
          toast.error("File integrity check failed.");
          return;
        }

        downloadFile(decryptedBytes!, filename, mimetype);
      } else {
        toast.error("Failed to download file.");
      }
    },
  });

  return (
    <Button
      className="cursor-pointer p-0 hover:bg-transparent"
      variant="ghost"
      disabled={isLoadingDownload}
      onClick={() => {
        download({
          variables: {
            fileId: file.id,
          },
        });
      }}
      asChild
    >
      <div className="flex w-20 select-none">
        <File className="size-8" />

        <div className="w-15 flex flex-col">
          <span className="truncate text-xs">{file.fileName}</span>
          <span className="truncate text-xs text-gray-500">
            ({formatBytes(parseInt(file.fileSize))})
          </span>
        </div>
      </div>
    </Button>
  );
};

export default MessageFileItem;
