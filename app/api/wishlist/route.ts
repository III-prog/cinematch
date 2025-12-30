import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: Request) {
	if (!BACKEND_URL) {
		return NextResponse.json({ error: "Backend URL is not configured" }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { movieId, title, posterUrl, overview, rating, year, genres } = body;

		if (!movieId) {
			return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
		}

		const cookie = request.headers.get("cookie");

		const backendRes = await fetch(`${BACKEND_URL}/api/wishlist/add`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(cookie && { cookie }),
			},
			credentials: "include",
			body: JSON.stringify({
				movieId,
				title,
				posterUrl,
				overview,
				rating,
				year,
				genres,
			}),
		});

		const data = await backendRes.json().catch(() => null);

		return NextResponse.json(data ?? { success: backendRes.ok }, { status: backendRes.status });
	} catch (error) {
		console.error("Add to wishlist error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// ============================================
// API ROUTE: Remove from Wishlist
// app/api/wishlist/remove/route.ts
// ============================================
export async function DELETE(request: Request) {
	if (!BACKEND_URL) {
		return NextResponse.json({ error: "Backend URL is not configured" }, { status: 500 });
	}

	try {
		const body = await request.json();
		const { movieId } = body;

		if (!movieId) {
			return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
		}

		const cookie = request.headers.get("cookie");

		const backendRes = await fetch(`${BACKEND_URL}/api/wishlist/delete`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				...(cookie && { cookie }),
			},
			credentials: "include",
			body: JSON.stringify({ movieId }),
		});

		const data = await backendRes.json().catch(() => null);

		return NextResponse.json(data ?? { success: backendRes.ok }, { status: backendRes.status });
	} catch (error) {
		console.error("Remove from wishlist error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// ============================================
// API ROUTE: Get User's Wishlist
// app/api/wishlist/route.ts
// ============================================
export async function GET(request: Request) {
	if (!BACKEND_URL) {
		return NextResponse.json({ error: "Backend URL is not configured" }, { status: 500 });
	}

	try {
		const url = new URL(request.url);
		const searchParams = url.searchParams;
		const page = searchParams.get("page");
		const idsOnly = searchParams.get("ids");

		const backendParams = new URLSearchParams();
		if (page) backendParams.set("page", page);

		const cookie = request.headers.get("cookie");

		const endpointPath = idsOnly === "1" || idsOnly === "true" ? "/api/wishlist/ids" : "/api/wishlist";

		const backendRes = await fetch(
			`${BACKEND_URL}${endpointPath}${backendParams.toString() ? `?${backendParams.toString()}` : ""}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					...(cookie && { cookie }),
				},
				credentials: "include",
			}
		);

		const data = await backendRes.json().catch(() => null);

		return NextResponse.json(data ?? { wishlist: [] }, { status: backendRes.status });
	} catch (error) {
		console.error("Get wishlist error:", error);
		return NextResponse.json({ error: "Internal Server Error", wishlist: [] }, { status: 500 });
	}
}
