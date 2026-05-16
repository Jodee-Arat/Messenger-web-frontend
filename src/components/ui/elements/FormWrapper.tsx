import { PropsWithChildren } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../common/Card";

interface FormWrapperProps {
  heading: string;
}

export function FormWrapper({
  heading,
  children,
}: PropsWithChildren<FormWrapperProps>) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/70 shadow-sm backdrop-blur sm:rounded-[28px]">
      <CardHeader className="border-b border-border/50 px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="text-base font-semibold tracking-tight">
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
