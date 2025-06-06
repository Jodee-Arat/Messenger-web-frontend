import { FC, PropsWithChildren } from "react";

import { cn } from "@/utils/tw-merge";

interface DragOverplayProp {
  className?: string;
}

const DragOverplay: FC<PropsWithChildren<DragOverplayProp>> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`bg-card border-primary-foreground text-primary-foreground hover:border-primary hover:text-primary inset-0 z-50 flex h-full w-full items-center justify-center border-4 border-dashed transition-opacity duration-300 ease-in-out *:absolute`}
    >
      {children}
    </div>
  );
};

export default DragOverplay;
