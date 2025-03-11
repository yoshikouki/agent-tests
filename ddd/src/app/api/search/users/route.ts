import { NextResponse } from "next/server";
import { SearchService } from "@/application/services/SearchService";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";
import { ProfileRepositoryImpl } from "@/infrastructure/repositories/ProfileRepositoryImpl";

// Search for users
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

		if (!query) {
			return NextResponse.json(
				{ error: "Search query is required" },
				{ status: 400 },
			);
		}

		// Create repositories and services
		const userRepository = new UserRepositoryImpl();
		const profileRepository = new ProfileRepositoryImpl();
		const searchService = new SearchService({
			userRepository,
			profileRepository,
		});

		try {
			// Search for users
			const { users, total } = await searchService.searchUsers(
				query,
				page,
				limit,
			);

			// Format user data
			const formattedUsers = users.map((user) => ({
				id: user.id,
				username: user.username,
			}));

			// Return search results
			return NextResponse.json({
				users: formattedUsers,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Search query cannot be empty") {
					return NextResponse.json(
						{ error: "Search query cannot be empty" },
						{ status: 400 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error searching for users:", error);
		return NextResponse.json(
			{ error: "Failed to search for users" },
			{ status: 500 },
		);
	}
}
