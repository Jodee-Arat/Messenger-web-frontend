import { type PropsWithChildren } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../common/Tooltip";

interface HintProps {
  label: string;
  asChild?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const Hint = ({
  label,
  align,
  asChild,
  side,
  sideOffset,
  children,
}: PropsWithChildren<HintProps>) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent
          className="pointer-events-none z-[60] max-w-60 whitespace-nowrap rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground shadow-lg"
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Hint;
