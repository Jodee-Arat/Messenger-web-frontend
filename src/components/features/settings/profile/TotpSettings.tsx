"use client";

import { useState } from "react";
import { Copy, KeyRound, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/common/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/Card";
import { Input } from "@/components/ui/common/Input";
import ConfirmModal from "@/components/ui/elements/ConfirmModal";
import {
  useGenerateTotpSecretMutation,
  useEnableTotpMutation,
  useDisableTotpMutation,
  useFindProfileQuery,
} from "@/shared/graphql/generated/output";

export default function TotpSettings() {
  const t = useTranslations("totp");
  const { data: profileData, refetch } = useFindProfileQuery();
  const user = profileData?.findProfile;

  const [generateTotpSecret, { loading: generating }] =
    useGenerateTotpSecretMutation();
  const [enableTotp, { loading: enabling }] = useEnableTotpMutation();
  const [disableTotp, { loading: disabling }] = useDisableTotpMutation();

  const [totpSecret, setTotpSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [setupMode, setSetupMode] = useState(false);

  const isTotpEnabled = user?.isTotpEnabled ?? false;

  async function handleGenerate() {
    try {
      const { data } = await generateTotpSecret();
      if (data?.generateTotpSecret) {
        setTotpSecret(data.generateTotpSecret.totpSecret);
        setQrCodeUrl(data.generateTotpSecret.qrCodeUrl);
        setSetupMode(true);
      }
    } catch {
      toast.error(t("failedToGenerate"));
    }
  }

  async function handleEnable() {
    if (token.length !== 6) {
      toast.error(t("enterSixDigitCodeError"));
      return;
    }
    try {
      const { data } = await enableTotp({ variables: { token } });
      if (data?.enableTotp) {
        toast.success(t("totpEnabled"));
        setSetupMode(false);
        setToken("");
        setTotpSecret("");
        setQrCodeUrl("");
        refetch();
      }
    } catch {
      toast.error(t("invalidCodeTryAgain"));
    }
  }

  async function handleDisable() {
    try {
      const { data } = await disableTotp();
      if (data?.disableTotp) {
        toast.success(t("totpDisabled"));
        refetch();
      }
    } catch {
      toast.error(t("failedToDisable"));
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(totpSecret);
    toast.success(t("secretCopied"));
  }

  if (isTotpEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-green-500" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("currently")}{" "}
            <span className="font-medium text-green-500">{t("enabled")}</span>.{" "}
            {t("accountProtected")}
          </p>
          <ConfirmModal
            heading={t("disable")}
            message={t("disableConfirm")}
            onConfirm={handleDisable}
          >
            <Button variant="destructive" disabled={disabling}>
              {disabling ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ShieldOff className="mr-2 size-4" />
              )}
              {t("disable")}
            </Button>
          </ConfirmModal>
        </CardContent>
      </Card>
    );
  }

  if (setupMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            {t("setup")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("scanQRDesc")}</p>

          {qrCodeUrl && (
            <div className="flex justify-center rounded-lg bg-white p-4">
              <img src={qrCodeUrl} alt="TOTP QR Code" className="size-48" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">{t("manualSecret")}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">
                {totpSecret}
              </code>
              <Button variant="outline" size="icon" onClick={copySecret}>
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{t("enterSixDigitCode")}</p>
            <div className="flex items-center gap-2">
              <Input
                value={token}
                onChange={e =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              <Button
                onClick={handleEnable}
                disabled={enabling || token.length !== 6}
              >
                {enabling ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {t("verifyAndEnable")}
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setSetupMode(false);
              setToken("");
            }}
          >
            {t("cancel")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldOff className="size-5 text-muted-foreground" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("currently")}{" "}
          <span className="font-medium text-destructive">{t("disabled")}</span>.{" "}
          {t("enableDescription")}
        </p>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 size-4" />
          )}
          {t("setup")}
        </Button>
      </CardContent>
    </Card>
  );
}
