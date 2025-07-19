import { FC, PropsWithChildren } from "react";

import { cn } from "@/utils/tw-merge";

interface DragOverplayProp {
  className?: string;
  isOver?: boolean;
}

const DragOverplay: FC<PropsWithChildren<DragOverplayProp>> = ({
  children,
  className,
  isOver = false,
}) => {
  return (
    <div
      className={cn(
        "bg-card absolute inset-0 flex h-full w-full items-center justify-center border-4 border-dashed transition-colors duration-500 ease-in-out",
        isOver
          ? "text-primary border-primary z-50 opacity-100"
          : "border-primary-foreground text-primary-foreground -z-50 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default DragOverplay;
