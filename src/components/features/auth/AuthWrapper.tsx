import { Send } from "lucide-react";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";

import { Button } from "@/components/ui/common/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";

interface AuthWrapperProp {
  heading: string;
  backButtonLabel?: string;
  backButtonHref?: string;
}

const AuthWrapper: FC<PropsWithChildren<AuthWrapperProp>> = ({
  heading,
  backButtonHref,
  backButtonLabel,
  children,
}) => {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-[450px]">
        <CardHeader className="flex-row items-center justify-center gap-x-4">
          {/* сюда добавить потом лого */}
          <Send className="size-10" />
          <CardTitle>{heading}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="-mt-2">
          {backButtonHref && backButtonLabel && (
            <Button variant="ghost" className="w-full">
              <Link href={backButtonHref}>{backButtonLabel}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthWrapper;
