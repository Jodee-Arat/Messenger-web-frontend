"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/common/Button";
import { cn } from "@/shared/utils/tw-merge";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

const BackButton = ({
  href,
  label,
  className,
  variant = "outline",
  size = "sm",
}: BackButtonProps) => {
  const router = useRouter();
  const tCommon = useTranslations("common");

  const content = (
    <>
      <ArrowLeft className="size-4" />
      {label ?? tCommon("back")}
    </>
  );

  const buttonClassName = cn(
    "h-10 rounded-full border-border/60 bg-background/60 px-4 backdrop-blur",
    className,
  );

  if (href) {
    return (
      <Button asChild variant={variant} size={size} className={buttonClassName}>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={buttonClassName}
      onClick={() => router.back()}
    >
      {content}
    </Button>
  );
};

export default BackButton;
