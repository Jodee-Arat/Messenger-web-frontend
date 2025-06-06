export async function sha1HashBytes(data: Uint8Array): Promise<string> {
  const normalArray = new Uint8Array(data);
  const hashBuffer = await crypto.subtle.digest("SHA-1", normalArray.buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
