import Link from "next/link";
import { FC, PropsWithChildren } from "react";

import BrandMark from "@/components/ui/elements/BrandMark";

interface AuthWrapperProp {
  heading: string;
  backButtonLabel?: string;
  backButtonLinkText?: string;
  backButtonHref?: string;
}

const AuthWrapper: FC<PropsWithChildren<AuthWrapperProp>> = ({
  heading,
  backButtonHref,
  backButtonLabel,
  backButtonLinkText,
  children,
}) => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-9/12 max-w-[400px]">
        <div className="mb-6 flex flex-col items-center gap-3">
          <BrandMark priority className="size-16" />
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">
            МесАгат
          </p>
        </div>
        <h1 className="text-foreground mb-8 text-center text-3xl font-medium">
          {heading}
        </h1>
        {children}
        {backButtonHref && backButtonLabel && (
          <p className="text-foreground mt-6 text-center text-base">
            {backButtonLabel}{" "}
            <Link
              href={backButtonHref}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {backButtonLinkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthWrapper;
