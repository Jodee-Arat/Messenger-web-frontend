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
    <Card className="overflow-hidden rounded-[28px] border-border/60 bg-card/70 shadow-sm backdrop-blur">
      <CardHeader className="border-b border-border/50 px-6 py-5">
        <CardTitle className="text-base font-semibold tracking-tight">
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
