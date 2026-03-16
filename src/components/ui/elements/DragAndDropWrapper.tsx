import { cn } from "@/shared/utils/tw-merge";
import { FileIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { FC, ReactNode, useState } from "react";

import DragOverplay from "./DragOverplay";

interface DragAndDropWrapperProps {
  drop: (e: React.DragEvent<HTMLDivElement>) => void | Promise<void>;
  className?: string;
  children: ReactNode;
}

const DragAndDropWrapper: FC<DragAndDropWrapperProps> = ({
  drop,
  className,
  children,
}) => {
  const t = useTranslations("messages");
  const [isOver, setIsOver] = useState<boolean>(false);
  const [dragCounter, setDragCounter] = useState<number>(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev + 1;
      if (newCount > 0) setIsOver(true);
      return newCount;
    });
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsOver(false);
        return 0;
      }
      return newCount;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    setIsOver(false);
    drop(e);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn("relative", className)}
    >
      <DragOverplay isOver={isOver}>
        <div className="flex h-full w-full items-center justify-center">
          <FileIcon className="size-15" />
          <p className="text-lg">{t("dropFilesHere")}</p>
        </div>
      </DragOverplay>
      {children}
    </div>
  );
};

export default DragAndDropWrapper;
