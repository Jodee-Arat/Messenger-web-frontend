import { formatBytes } from "@/shared/utils/format-bytes";
import { File, Loader2, X } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/common/Button";

interface FileItemProp {
  file: { name: string; size: string };
  onDeleteFile: () => void;
  isLoadingSend: boolean;
}

const FileItem: FC<FileItemProp> = ({ file, isLoadingSend, onDeleteFile }) => {
  return (
    <div className="flex min-w-[180px] max-w-[220px] items-center gap-3 rounded-[22px] border border-border/60 bg-card/80 px-3 py-2 shadow-sm">
      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-2xl">
        <File className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatBytes(parseInt(file.size, 10))}
        </p>
      </div>

      {isLoadingSend ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <Button
          type="button"
          className="size-8 shrink-0 rounded-full"
          variant="ghost"
          size="icon"
          onClick={onDeleteFile}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
};

export default FileItem;
