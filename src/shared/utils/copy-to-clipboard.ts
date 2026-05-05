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

export const copyToClipboard = (text: string): void => {
  if (!text) return;

  if (!navigator.clipboard) {
    if (copyWithFallback(text)) {
      toast.success("Copied to clipboard");
      return;
    }

    toast.error("Failed to copy");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch((err) => {
      if (copyWithFallback(text)) {
        toast.success("Copied to clipboard");
        return;
      }

      toast.error("Failed to copy: " + err.message);
      console.error("Failed to copy text: ", err);
    });
};
