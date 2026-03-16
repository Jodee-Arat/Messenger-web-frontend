import { cn } from "@/shared/utils/tw-merge";
import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-border text-foreground placeholder:text-muted-foreground bg-background flex h-11 w-full rounded-xl border px-4 py-2.5 text-base transition-colors focus:border-primary focus:outline-0 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        autoCapitalize="none"
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
