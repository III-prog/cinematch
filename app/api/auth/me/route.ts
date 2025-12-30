import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: Request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { authenticated: false, error: "Backend URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const cookie = request.headers.get("cookie");

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        ...(cookie && { cookie }),
      },
    });

    const data = await backendRes.json().catch(() => null);

    return NextResponse.json(
      data ?? { authenticated: backendRes.ok },
      { status: backendRes.status }
    );
  } catch (error) {
    console.error("Auth me API error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}