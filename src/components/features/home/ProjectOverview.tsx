"use client";

import {
  Apple,
  Globe,
  Lock,
  MessageSquare,
  Shield,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import BrandMark from "@/components/ui/elements/BrandMark";
import { Button } from "@/components/ui/common/Button";

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
    "ГОСТ 34.10-2018",
    "ГОСТ 34.11-2018 (Стрибог)",
    "ГОСТ 34.12-2018 (Кузнечик)",
    "ГОСТ 34.13-2018",
    "X3DH",
  ],
};

export default function ProjectOverview() {
  const t = useTranslations("overview");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center space-y-8 pb-8 pt-2 sm:space-y-12 md:pt-12">
      {/* Hero Welcome Section */}
      <div className="relative flex flex-col items-center text-center space-y-6 w-full">
        <div className="absolute -top-20 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />

        <BrandMark
          priority
          className="size-24 rounded-[2rem] bg-background/80 ring-1 ring-border shadow-2xl shadow-primary/20 backdrop-blur-xl"
          imageClassName="p-[10%]"
        />

        <div className="space-y-4 max-w-2xl">
          <h1 className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            {t("welcomeTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            {t("welcomeSubtitle")}
          </p>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Download App CTA */}
      <Card className="w-full max-w-3xl border-primary/30 bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm shadow-xl shadow-primary/5">
        <div className="flex flex-col items-center justify-between gap-5 p-4 sm:p-6 md:flex-row md:gap-8 md:p-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {t("getMobileApp")}
            </h3>
            <p className="text-muted-foreground">{t("getMobileAppDesc")}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <Button
              size="lg"
              className="gap-2 h-14 rounded-xl px-6 bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
              asChild
            >
              <Link href="#">
                <Apple className="size-5" />
                <div className="flex flex-col items-start space-y-0 text-left">
                  <span className="text-[10px] leading-none opacity-80 font-medium tracking-wide uppercase">
                    {t("downloadIOS")}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {t("appStore")}
                  </span>
                </div>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 h-14 rounded-xl px-6 border-border shadow-sm bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105 active:scale-95"
              asChild
            >
              <Link href="#">
                <Smartphone className="size-5 text-primary" />
                <div className="flex flex-col items-start space-y-0 text-left">
                  <span className="text-[10px] leading-none opacity-80 font-medium tracking-wide uppercase">
                    {t("downloadAndroid")}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {t("googlePlay")}
                  </span>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="w-full space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, translationKey }) => (
            <Card
              key={translationKey}
              className="group relative overflow-hidden border-border/60 bg-background/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-secondary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold text-foreground">
                  {t(`features.${translationKey}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`features.${translationKey}.desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="w-full space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center md:text-left">
          {t("techTitle")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(techStack).map(([category, items]) => (
            <Card
              key={category}
              className="flex flex-col overflow-hidden border-border/60 bg-background/60 backdrop-blur-md transition-shadow hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <div className="size-2 rounded-full bg-primary/80" />
                </div>
                <CardTitle className="text-base font-semibold capitalize text-foreground m-0 leading-none">
                  {t(`tech.${category}`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 content-start">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-secondary border border-border px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary-foreground/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
