import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const query = searchParams.get("q");

	if (!query || query.trim().length < 2) {
		return NextResponse.json({
			users: [],
			message: "Search query must be at least 2 characters long",
		});
	}

	try {
		const db = await getDb();

		// Search for users by name or email
		const searchTerm = `%${query}%`;

		const users = await db.all(
			`
      SELECT 
        id, 
        name, 
        email, 
        image_url as imageUrl
      FROM users 
      WHERE 
        name LIKE ? OR 
        email LIKE ? 
      LIMIT 10
    `,
			searchTerm,
			searchTerm,
		);

		return NextResponse.json({ users });
	} catch (error) {
		console.error("Error searching users:", error);
		return NextResponse.json(
			{ error: "Failed to search users" },
			{ status: 500 },
		);
	}
}
