import { SendFileType } from "@/shared/types/send-file.type";
import { FC } from "react";

import FileItem from "./FileItem";

interface FileListProp {
  files: SendFileType[];
  filesEdited: SendFileType[];
  onDeleteFile: (id: string) => void;
  isLoadingSend: boolean;
}

const FileList: FC<FileListProp> = ({
  files,
  filesEdited,
  onDeleteFile,
  isLoadingSend,
}) => {
  const visibleFiles = filesEdited.length > 0 ? filesEdited : files;

  return (
    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
      {visibleFiles.map((file, index) => (
        <FileItem
          key={`${file.id ?? file.name}-${index}`}
          file={file}
          onDeleteFile={() => {
            if (file.id) {
              onDeleteFile(file.id);
            }
          }}
          isLoadingSend={isLoadingSend && visibleFiles.length - 1 === index}
        />
      ))}
    </div>
  );
};

export default FileList;
