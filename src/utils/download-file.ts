export function downloadFile(
  bytes: Uint8Array,
  filename: string,
  mimetype: string
) {
  const blob = new Blob([new Uint8Array(bytes)], { type: mimetype });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
