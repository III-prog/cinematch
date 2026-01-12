import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

// HTML sanitization function
function sanitizeHTML(str: string): string {
	return (
		str
			// Remove script tags and their content
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			// Remove all HTML tags
			.replace(/<[^>]*>/g, "")
			// Remove potentially dangerous attributes
			.replace(/on\w+="[^"]*"/gi, "")
			.replace(/javascript:/gi, "")
			.replace(/vbscript:/gi, "")
			.replace(/data:/gi, "")
			// Convert special characters to HTML entities
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;")
			.replace(/\//g, "&#x2F;")
			// Trim whitespace
			.trim()
	);
}

export async function POST(request: Request) {
	if (!BACKEND_URL) {
		return NextResponse.json({ error: "Backend URL is not configured" }, { status: 500 });
	}

	try {
		const body = await request.json().catch(() => ({}));

		// Validate required fields
		const { name, email, message } = body;

		if (!name || !email || !message) {
			return NextResponse.json({ error: "All fields are required" }, { status: 400 });
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
		}

		// Validate message length
		if (message.length < 10) {
			return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
		}

		// Sanitize data before forwarding to backend
		const sanitizedData = {
			name: sanitizeHTML(name.trim()),
			email: sanitizeHTML(email.trim()),
			message: sanitizeHTML(message.trim()),
		};

		// Forward to backend
		const backendRes = await fetch(`${BACKEND_URL}/api/contact`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(sanitizedData),
		});

		const data = await backendRes.json().catch(() => null);

		const response = NextResponse.json(data ?? { success: backendRes.ok }, { status: backendRes.status });

		return response;
	} catch (error) {
		console.error("Contact API error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
