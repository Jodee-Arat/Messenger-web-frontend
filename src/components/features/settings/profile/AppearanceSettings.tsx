"use client";

import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import { Button } from "@/components/ui/common/Button";
import { setLanguage } from "@/shared/libs/i18n/language";
import type { Language } from "@/shared/libs/i18n/config";

export default function AppearanceSettings() {
  const t = useTranslations("appearance");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const themes = [
    { value: "light", label: t("lightTheme"), icon: Sun },
    { value: "dark", label: t("darkTheme"), icon: Moon },
    { value: "system", label: t("systemTheme"), icon: Monitor },
  ] as const;

  const languages = [
    { value: "en" as Language, label: "English", flag: "🇺🇸" },
    { value: "ru" as Language, label: "Русский", flag: "🇷🇺" },
  ] as const;

  function handleLanguageChange(lang: Language) {
    startTransition(async () => {
      await setLanguage(lang);
      router.refresh();
      toast.success(t("languageChanged"));
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("theme")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(themeOption => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;
              return (
                <Button
                  key={themeOption.value}
                  variant={isActive ? "default" : "outline"}
                  className="flex h-20 flex-col items-center justify-center gap-2"
                  onClick={() => setTheme(themeOption.value)}
                >
                  <Icon className="size-5" />
                  <span className="text-xs">{themeOption.label}</span>
                  {isActive && <Check className="size-3" />}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {languages.map(lang => (
              <Button
                key={lang.value}
                variant="outline"
                className="flex h-14 items-center justify-start gap-3"
                onClick={() => handleLanguageChange(lang.value)}
                disabled={isPending}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
