import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMediaSource } from "./get-media-source";

vi.mock("@/shared/libs/constants/url.constant", () => ({
  MEDIA_URL: "https://cdn.example.com",
}));

describe("getMediaSource", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
  });

  it("should return empty string for null path", () => {
    expect(getMediaSource(null)).toBe("");
  });

  it("should return empty string for undefined path", () => {
    expect(getMediaSource(undefined)).toBe("");
  });

  it("should return empty string for empty string path", () => {
    expect(getMediaSource("")).toBe("");
  });

  it("should construct URL with cache buster", () => {
    const result = getMediaSource("/images/avatar.png");
    expect(result).toBe(
      "https://cdn.example.com/images/avatar.png?v=1700000000000",
    );
  });

  it("should handle path without leading slash", () => {
    const result = getMediaSource("uploads/file.jpg");
    expect(result).toBe(
      "https://cdn.example.comuploads/file.jpg?v=1700000000000",
    );
  });
});
