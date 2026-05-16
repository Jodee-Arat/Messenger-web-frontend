import { toast } from "sonner";

const copyWithFallback = (text: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  return copied;
};

interface CopyToClipboardMessages {
  copied: string;
  failed: string;
}

const defaultMessages: CopyToClipboardMessages = {
  copied: "Copied to clipboard",
  failed: "Failed to copy",
};

export const copyToClipboard = (
  text: string,
  messages: CopyToClipboardMessages = defaultMessages,
): void => {
  if (!text) return;

  if (!navigator.clipboard) {
    if (copyWithFallback(text)) {
      toast.success(messages.copied);
      return;
    }

    toast.error(messages.failed);
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success(messages.copied);
    })
    .catch((err) => {
      if (copyWithFallback(text)) {
        toast.success(messages.copied);
        return;
      }

      toast.error(`${messages.failed}: ${err.message}`);
      console.error("Failed to copy text: ", err);
    });
};
