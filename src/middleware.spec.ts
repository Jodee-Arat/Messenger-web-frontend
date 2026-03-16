import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock NextResponse before importing middleware
const mockRedirect = vi.fn();
const mockNext = vi.fn();

vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    redirect: (...args: any[]) => {
      mockRedirect(...args);
      return { type: "redirect", url: args[0]?.toString() };
    },
    next: (...args: any[]) => {
      mockNext(...args);
      return { type: "next" };
    },
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import middleware from "./middleware";

function createMockRequest(pathname: string, sessionValue?: string) {
  return {
    url: "http://localhost:3000" + pathname,
    cookies: {
      get: (name: string) =>
        name === "session" && sessionValue
          ? { value: sessionValue }
          : undefined,
    },
    nextUrl: {
      pathname,
    },
  } as any;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SERVER_URL = "http://localhost:4000";
  });

  it("should redirect to /account/login if no session cookie", async () => {
    const request = createMockRequest("/group/123");

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.toString()).toContain("/account/login");
  });

  it("should call NextResponse.next() for non-chat group path with session", async () => {
    const request = createMockRequest("/group/123", "valid-session");

    await middleware(request);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should check chat access for /group/groupId/chatId paths", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ data: { checkChatAccess: true } }),
    });

    const request = createMockRequest("/group/grp1/chat1", "valid-session");

    await middleware(request);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:4000/graphql",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Cookie: "session=valid-session",
        }),
      }),
    );
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should redirect to /403 if chat access denied", async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ data: { checkChatAccess: false } }),
    });

    const request = createMockRequest("/group/grp1/chat1", "valid-session");

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.toString()).toContain("/403");
  });

  it("should redirect to /error if fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const request = createMockRequest("/group/grp1/chat1", "valid-session");

    await middleware(request);

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.toString()).toContain("/error");
  });
});
