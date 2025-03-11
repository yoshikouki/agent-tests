import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET =
	process.env.JWT_SECRET || "default_jwt_secret_replace_in_production";

// Define which paths require authentication
const protectedPaths = [
	"/api/users/me",
	"/api/posts/create",
	"/api/posts/edit",
	"/api/posts/delete",
	"/api/comments/create",
	"/api/comments/edit",
	"/api/comments/delete",
	"/api/follows",
];

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// Check if the path is protected
	const isProtectedPath = protectedPaths.some((protectedPath) =>
		path.startsWith(protectedPath),
	);

	if (!isProtectedPath) {
		return NextResponse.next();
	}

	// Get the authorization header
	const authHeader = request.headers.get("authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return NextResponse.json(
			{ error: "Unauthorized - Missing or invalid token" },
			{ status: 401 },
		);
	}

	// Extract token
	const token = authHeader.split(" ")[1];

	try {
		// Verify token
		const decoded = verify(token, JWT_SECRET) as { userId: string };

		// Add user ID to request headers for later use in API routes
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set("x-user-id", decoded.userId);

		// Return modified request
		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Unauthorized - Invalid token" },
			{ status: 401 },
		);
	}
}

// Configure which paths the middleware runs on
export const config = {
	matcher: ["/api/:path*"],
};
