"use client";

import { cn } from "@/shared/utils/tw-merge";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className={cn(
          "border-border text-foreground placeholder:text-muted-foreground bg-background flex h-11 w-full rounded-xl border px-4 py-2.5 pr-10 text-base transition-colors focus:border-primary focus:outline-0 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        autoCapitalize="none"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
        onClick={() => setShowPassword(prev => !prev)}
        aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
      >
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
