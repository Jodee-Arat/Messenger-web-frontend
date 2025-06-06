import { FC } from "react";

import { SendFileType } from "../../../types/send-file.type";

import FileItem from "./FileItem";

interface FileListProp {
  files: SendFileType[];
  onDeleteFile: (id: string) => void;
  isLoadingSend: boolean;
}

const FileList: FC<FileListProp> = ({ files, onDeleteFile, isLoadingSend }) => {
  return (
    <div className="flex gap-x-4 overflow-x-auto">
      {files.map((file, index) => (
        <FileItem
          key={index}
          file={file}
          onDeleteFile={() => onDeleteFile(file.id!)}
          isLoadingSend={isLoadingSend && files.length - 1 === index}
        />
      ))}
    </div>
  );
};

export default FileList;
