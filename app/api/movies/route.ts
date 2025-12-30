import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: Request) {
	if (!BACKEND_URL) {
		return NextResponse.json({ error: "Backend URL is not configured" }, { status: 500 });
	}

	try {
		const url = new URL(request.url);
		const searchParams = url.searchParams;

		const page = searchParams.get("page");
		const languages = searchParams.get("languages");
		const search = searchParams.get("search");

		const backendParams = new URLSearchParams();

		if (page) backendParams.set("page", page);
		if (languages) backendParams.set("languages", languages);
		if (search) backendParams.set("search", search);

		const cookie = request.headers.get("cookie");

		const backendRes = await fetch(`${BACKEND_URL}/api/movies/discover?${backendParams.toString()}`, {
			method: "GET",
			headers: {
				...(cookie && { cookie }),
			},
		});

		const data = await backendRes.json().catch(() => null);

		return NextResponse.json(data ?? { movies: [], success: backendRes.ok }, { status: backendRes.status });
	} catch (error) {
		console.error("Movies API error:", error);
		return NextResponse.json({ movies: [], error: "Internal Server Error" }, { status: 500 });
	}
}
