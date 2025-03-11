import { NextResponse } from "next/server";
import { FollowService } from "@/application/services/FollowService";
import { FollowRepositoryImpl } from "@/infrastructure/repositories/FollowRepositoryImpl";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";

// Follow a user
export async function POST(request: Request) {
	try {
		// Get user ID from request headers (set by middleware)
		const followerId = request.headers.get("x-user-id");

		if (!followerId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		const { userId: followedId } = body;

		if (!followedId) {
			return NextResponse.json(
				{ error: "User ID to follow is required" },
				{ status: 400 },
			);
		}

		// Create repositories and services
		const followRepository = new FollowRepositoryImpl();
		const userRepository = new UserRepositoryImpl();
		const followService = new FollowService({
			followRepository,
			userRepository,
		});

		try {
			// Follow user
			await followService.followUser(followerId, followedId);

			// Get follower counts
			const followerCount = await followService.getFollowersCount(followedId);
			const followingCount = await followService.getFollowingCount(followerId);

			// Return success response
			return NextResponse.json({
				message: "Successfully followed user",
				followerCount,
				followingCount,
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "User not found") {
					return NextResponse.json(
						{ error: "User not found" },
						{ status: 404 },
					);
				}
				if (error.message === "Cannot follow yourself") {
					return NextResponse.json(
						{ error: "Cannot follow yourself" },
						{ status: 400 },
					);
				}
				if (error.message === "Already following this user") {
					return NextResponse.json(
						{ error: "Already following this user" },
						{ status: 409 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error following user:", error);
		return NextResponse.json(
			{ error: "Failed to follow user" },
			{ status: 500 },
		);
	}
}

// Unfollow a user
export async function DELETE(request: Request) {
	try {
		// Get user ID from request headers (set by middleware)
		const followerId = request.headers.get("x-user-id");

		if (!followerId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse URL parameters
		const { searchParams } = new URL(request.url);
		const followedId = searchParams.get("userId");

		if (!followedId) {
			return NextResponse.json(
				{ error: "User ID to unfollow is required" },
				{ status: 400 },
			);
		}

		// Create repositories and services
		const followRepository = new FollowRepositoryImpl();
		const userRepository = new UserRepositoryImpl();
		const followService = new FollowService({
			followRepository,
			userRepository,
		});

		try {
			// Unfollow user
			await followService.unfollowUser(followerId, followedId);

			// Get follower counts
			const followerCount = await followService.getFollowersCount(followedId);
			const followingCount = await followService.getFollowingCount(followerId);

			// Return success response
			return NextResponse.json({
				message: "Successfully unfollowed user",
				followerCount,
				followingCount,
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Not following this user") {
					return NextResponse.json(
						{ error: "Not following this user" },
						{ status: 404 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error unfollowing user:", error);
		return NextResponse.json(
			{ error: "Failed to unfollow user" },
			{ status: 500 },
		);
	}
}
