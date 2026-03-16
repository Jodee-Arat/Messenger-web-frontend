"use client";

import { Globe, Lock, MessageSquare, Shield, Users, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";

const features = [
  { icon: Lock, translationKey: "e2ee" },
  { icon: Shield, translationKey: "gost" },
  { icon: MessageSquare, translationKey: "realtime" },
  { icon: Users, translationKey: "groups" },
  { icon: Zap, translationKey: "modern" },
  { icon: Globe, translationKey: "open" },
] as const;

const techStack = {
  frontend: ["React", "Next.js", "TypeScript", "Apollo Client", "TailwindCSS"],
  backend: ["NestJS", "GraphQL", "PostgreSQL", "Prisma", "Redis"],
  mobile: ["React Native", "Expo"],
  crypto: [
    "ГОСТ Р 34.10-2012",
    "ГОСТ Р 34.11-2012 (Стрибог)",
    "ГОСТ Р 34.12-2018 (Кузнечик)",
    "X3DH",
  ],
};

export default function ProjectOverview() {
  const t = useTranslations("overview");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          MesArat
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Features grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, translationKey }) => (
          <Card key={translationKey} className="border-border/50">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold">
                {t(`features.${translationKey}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t(`features.${translationKey}.desc`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tech stack */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">{t("techTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(techStack).map(([category, items]) => (
              <div key={category}>
                <h4 className="mb-2 text-sm font-semibold capitalize text-foreground">
                  {t(`tech.${category}`)}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(item => (
                    <span
                      key={item}
                      className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
