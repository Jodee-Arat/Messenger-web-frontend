import { toast } from "sonner";

export const copyToClipboard = (text: string): void => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success("Copied to clipboard");
    })
    .catch((err) => {
      toast.error("Failed to copy: " + err.message);
      console.error("Failed to copy text: ", err);
    });
};
