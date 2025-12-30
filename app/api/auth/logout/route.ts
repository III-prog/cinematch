import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL;

function appendSetCookies(backendRes: Response, response: NextResponse): void {
  const setCookieHeader = backendRes.headers.get("set-cookie");
  
  if (setCookieHeader) {
    response.headers.append("set-cookie", setCookieHeader);
  }
}

export async function POST(request: Request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await backendRes.json().catch(() => null);

    const response = NextResponse.json(
      data ?? { success: backendRes.ok },
      { status: backendRes.status }
    );

    appendSetCookies(backendRes, response);

    // Clear token cookie defensively
    response.cookies.set("token", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}