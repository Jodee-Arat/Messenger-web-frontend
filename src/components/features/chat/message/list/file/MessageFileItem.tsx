import { useDownloadFileMutation } from "@/shared/graphql/generated/output";
import { MessageFileType } from "@/shared/types/message-file.type";
import { downloadFile } from "@/shared/utils/download-file";
import { formatBytes } from "@/shared/utils/format-bytes";
import { cn } from "@/shared/utils/tw-merge";
import { Download, File, ImageIcon, LoaderCircle } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/common/Dialog";

const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "heif",
];

const isImageFile = (format: string) =>
  IMAGE_EXTENSIONS.includes(format.toLowerCase());

interface MessageFileItemProp {
  file: MessageFileType;
  chatId: string;
  isSelected: boolean;
  isOwnMessage?: boolean;
}

const MessageFileItem: FC<MessageFileItemProp> = ({
  file,
  chatId,
  isSelected,
  isOwnMessage = false,
}) => {
  const t = useTranslations("messages");
  const isImage = isImageFile(file.fileFormat);
  const displayName = (() => {
    try {
      return decodeURIComponent(file.fileName);
    } catch {
      return file.fileName;
    }
  })();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [isPreviewResolved, setIsPreviewResolved] = useState(!isImage);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [requestFile, { loading: isLoadingDownload }] = useDownloadFileMutation();

  useEffect(() => {
    if (!isImage || imageUrl) return;

    let isMounted = true;

    const loadPreview = async () => {
      try {
        const result = await requestFile({
          variables: {
            fileId: file.id,
            chatId,
          },
        });
        const downloadData = result.data?.downloadFile;

        if (downloadData && isMounted) {
          setImageUrl(downloadData.fileUrl);
        }
      } finally {
        if (isMounted) {
          setIsPreviewResolved(true);
        }
      }
    };

    void loadPreview();

    return () => {
      isMounted = false;
    };
  }, [chatId, file.id, imageUrl, isImage, requestFile]);

  const getDownloadData = async () => {
    const result = await requestFile({
      variables: {
        fileId: file.id,
        chatId,
      },
    });

    return result.data?.downloadFile ?? null;
  };

  const handleRegularDownload = async () => {
    if (isSelected || isLoadingDownload) return;

    try {
      const downloadData = await getDownloadData();

      if (!downloadData) {
        toast.error(t("fileDownloadFailed"));
        return;
      }

      await downloadFile(downloadData.fileUrl, downloadData.filename);
    } catch {
      toast.error(t("fileDownloadError"));
    }
  };

  const loadImagePreview = async ({
    openViewer = false,
    showErrorToast = false,
  }: {
    openViewer?: boolean;
    showErrorToast?: boolean;
  } = {}) => {
    if (isSelected || isLoadingDownload) return;

    setIsPreviewResolved(false);

    try {
      const downloadData = await getDownloadData();

      if (!downloadData) {
        if (showErrorToast) {
          toast.error(t("fileDownloadFailed"));
        }
        return;
      }

      setImageUrl(downloadData.fileUrl);

      if (openViewer) {
        setFullscreenVisible(true);
      }
    } catch {
      if (showErrorToast) {
        toast.error(t("fileDownloadError"));
      }
    } finally {
      setIsPreviewResolved(true);
    }
  };

  const handleImagePress = () => {
    if (isSelected) return;

    if (imageUrl) {
      setFullscreenVisible(true);
      return;
    }

    void loadImagePreview({
      openViewer: true,
      showErrorToast: true,
    });
  };

  const handleImageDownload = async () => {
    if (!imageUrl || isSavingImage) return;

    setIsSavingImage(true);

    try {
      await downloadFile(imageUrl, displayName);
    } catch {
      toast.error(t("fileDownloadError"));
    } finally {
      setIsSavingImage(false);
    }
  };

  if (isImage) {
    const previewToneClass = isOwnMessage
      ? "border-white/10 bg-primary-foreground/5"
      : "border-border/60 bg-background/20";
    const placeholderToneClass = isOwnMessage
      ? "bg-primary-foreground/10 text-primary-foreground"
      : "bg-background/40 text-foreground";
    const placeholderHintClass = isOwnMessage
      ? "text-primary-foreground/70"
      : "text-muted-foreground";

    return (
      <>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-auto overflow-hidden rounded-2xl border p-0",
            previewToneClass,
          )}
          disabled={isSelected}
          onClick={handleImagePress}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="aspect-square w-56 object-cover sm:w-72"
              loading="lazy"
            />
          ) : (
            <div
              className={cn(
                "flex aspect-square w-56 flex-col items-center justify-center gap-2 px-4 text-center sm:w-72",
                placeholderToneClass,
              )}
            >
              {isLoadingDownload || !isPreviewResolved ? (
                <LoaderCircle className="size-6 animate-spin" />
              ) : (
                <ImageIcon className="size-8" />
              )}

              <span className="max-w-full truncate text-xs font-medium">
                {displayName}
              </span>
              <span className={cn("text-[11px]", placeholderHintClass)}>
                {isLoadingDownload || !isPreviewResolved
                  ? t("loading")
                  : t("tryAgain")}
              </span>
            </div>
          )}
        </Button>

        <Dialog
          open={fullscreenVisible}
          onOpenChange={setFullscreenVisible}
        >
          <DialogContent
            className={cn(
              "w-[min(96vw,72rem)] max-w-[min(96vw,72rem)] border-white/10 bg-black/95 p-3 text-white shadow-2xl",
              "[&>button]:text-white [&>button]:data-[state=open]:bg-white/10 [&>button]:data-[state=open]:text-white [&>button]:hover:bg-white/10 [&>button]:focus:ring-white/40",
            )}
          >
            <DialogTitle className="sr-only">{t("imagePreview")}</DialogTitle>
            <DialogDescription className="sr-only">
              {displayName}
            </DialogDescription>

            <div className="flex max-h-[82vh] items-center justify-center overflow-hidden rounded-xl bg-black/80">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={displayName}
                  className="max-h-[82vh] w-auto max-w-full object-contain"
                />
              ) : (
                <div className="flex min-h-80 w-full items-center justify-center">
                  <LoaderCircle className="size-7 animate-spin text-white/80" />
                </div>
              )}
            </div>

            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={handleImageDownload}
                disabled={!imageUrl || isSavingImage}
              >
                {isSavingImage ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {t("downloadImage")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button
      className={cn(
        "h-auto rounded-2xl border p-0",
        isOwnMessage
          ? "border-white/10 bg-primary-foreground/10 hover:bg-primary-foreground/15"
          : "border-border/60 bg-background/40 hover:bg-background/55",
      )}
      variant="ghost"
      disabled={isSelected || isLoadingDownload}
      onClick={handleRegularDownload}
    >
      <div className="flex min-w-0 max-w-56 select-none items-center gap-2 px-3 py-2">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            isOwnMessage ? "bg-primary-foreground/15" : "bg-primary/10",
          )}
        >
          <File
            className={cn(
              "size-4",
              isOwnMessage ? "text-primary-foreground" : "text-primary",
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-xs font-medium",
              isOwnMessage && "text-primary-foreground",
            )}
          >
            {displayName}
          </span>
          <span
            className={cn(
              "block truncate text-[11px]",
              isOwnMessage
                ? "text-primary-foreground/70"
                : "text-muted-foreground",
            )}
          >
            ({formatBytes(parseInt(file.fileSize, 10))})
          </span>
        </div>
      </div>
    </Button>
  );
};

export default MessageFileItem;
