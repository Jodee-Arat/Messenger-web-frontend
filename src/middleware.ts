import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { url, cookies, nextUrl } = request;

  const session = cookies.get("session")?.value;
  // const isAuthRoute = nextUrl.pathname.startsWith("/chat");
  // const isDeactivateRoute = nextUrl.pathname === "/account/deactivate";
  // const isDashBoardRoute = nextUrl.pathname.startsWith("/dashboard");

  // if (!session && isDashBoardRoute) {
  //   return NextResponse.redirect(new URL("/account/login", url));
  // }

  if (!session) {
    return NextResponse.redirect(new URL("/account/login", url));
  }

  const chatMatch = nextUrl.pathname.match(/^\/group\/[^\/]+\/([^\/]+)/);
  const chatId = chatMatch?.[1];

  // Skip access check for known static sub-routes (e.g. /group/:id/settings)
  const staticSubRoutes = ["settings"];

  if (chatId && !staticSubRoutes.includes(chatId)) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session=${session}`,
        },
        body: JSON.stringify({
          query: `
          query CheckChatAccess($chatId: String!) {
            checkChatAccess(chatId: $chatId)
          }
        `,
          variables: { chatId },
        }),
      });

      const result = await res.json();

      if (!result?.data?.checkChatAccess) {
        return NextResponse.redirect(new URL("/403", url));
      }
    } catch (e) {
      console.error("Access check failed", e);
      return NextResponse.redirect(new URL("/error", url));
    }
  }

  // && !isDeactivateRoute
  // if (session && isAuthRoute ) {
  //   return NextResponse.redirect(new URL("/dashboard/settings", url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/group/:path*"],
};
