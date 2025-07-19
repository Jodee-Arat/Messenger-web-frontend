import { File, Loader2, X } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/common/Button";

import { formatBytes } from "@/utils/format-bytes";

interface FileItemProp {
  file: { name: string; size: string };
  onDeleteFile: () => void;
  isLoadingSend: boolean;
}

const FileItem: FC<FileItemProp> = ({ file, isLoadingSend, onDeleteFile }) => {
  return (
    <div>
      <div className="flex cursor-grab select-none">
        <File className="size-8" />

        <div className="w-15 flex flex-col">
          <span className="truncate text-xs">{file.name}</span>
          <span className="truncate text-xs text-gray-500">
            ({formatBytes(parseInt(file.size))})
          </span>
        </div>
        {isLoadingSend ? (
          <Loader2 className="ml-1 size-5 animate-spin" />
        ) : (
          <Button
            className="ml-1 size-5 rounded-full p-0"
            onClick={onDeleteFile}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileItem;
