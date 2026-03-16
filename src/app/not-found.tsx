import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFoundPage() {
  const t = await getTranslations("common");
  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center gap-6 bg-background text-foreground">
      <div className="text-center space-y-2">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">{t("pageNotFound")}</p>
        <p className="text-sm text-muted-foreground">{t("pageNotFoundDesc")}</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
