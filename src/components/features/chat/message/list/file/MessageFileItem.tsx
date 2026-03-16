import { useDownloadFileMutation } from "@/shared/graphql/generated/output";
import { MessageFileType } from "@/shared/types/message-file.type";
import { downloadFile } from "@/shared/utils/download-file";
import { formatBytes } from "@/shared/utils/format-bytes";
import { File } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";

interface MessageFileItemProp {
  file: MessageFileType;
  chatId: string;
  isSelected: boolean;
}

const MessageFileItem: FC<MessageFileItemProp> = ({
  file,
  chatId,
  isSelected,
}) => {
  const [download, { loading: isLoadingDownload }] = useDownloadFileMutation({
    onCompleted: async (data) => {
      if (data.downloadFile) {
        const { fileUrl, filename } = data.downloadFile;

        downloadFile(fileUrl, filename);
      } else {
        toast.error("Failed to download file.");
      }
    },
  });

  return (
    <Button
      className="cursor-pointer p-0 hover:bg-transparent"
      variant="ghost"
      disabled={isSelected || isLoadingDownload}
      onClick={() => {
        download({
          variables: {
            fileId: file.id,
            chatId,
          },
        });
      }}
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
