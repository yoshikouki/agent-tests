import { NextResponse } from "next/server";
import { FollowService } from "@/application/services/FollowService";
import { FollowRepositoryImpl } from "@/infrastructure/repositories/FollowRepositoryImpl";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";

// Get a user's followers
export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const userId = params.id;
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

		// Create repositories and services
		const followRepository = new FollowRepositoryImpl();
		const userRepository = new UserRepositoryImpl();
		const followService = new FollowService({
			followRepository,
			userRepository,
		});

		// Check if user exists
		const userExists = await userRepository.findById(userId);

		if (!userExists) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get followers
		const { users: followerIds, total } = await followService.getFollowers(
			userId,
			page,
			limit,
		);

		// Get user details for each follower
		const followers = await Promise.all(
			followerIds.map(async (followerId) => {
				const user = await userRepository.findById(followerId);
				return user
					? {
							id: user.id,
							username: user.username,
						}
					: null;
			}),
		).then((results) => results.filter(Boolean));

		// Return followers
		return NextResponse.json({
			followers,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error fetching followers:", error);
		return NextResponse.json(
			{ error: "Failed to fetch followers" },
			{ status: 500 },
		);
	}
}
