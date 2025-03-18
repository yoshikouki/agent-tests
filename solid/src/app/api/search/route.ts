import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		// Verify authentication
		const session = await getSession();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;

		// Get search query from URL
		const url = new URL(request.url);
		const query = url.searchParams.get("q");

		if (!query) {
			return NextResponse.json(
				{ error: "Search query is required" },
				{ status: 400 },
			);
		}

		// Search for users matching the query in username or name from their profile
		const users = await prisma.user.findMany({
			where: {
				NOT: {
					id: userId, // Exclude the current user
				},
				profile: {
					OR: [
						{ username: { contains: query } },
						{ name: { contains: query } },
					],
				},
			},
			include: {
				profile: true,
				_count: {
					select: {
						posts: true,
						followedBy: true,
						following: true,
					},
				},
				followedBy: {
					where: {
						followerId: userId,
					},
				},
			},
			take: 20, // Limit results
		});

		// Format users with isFollowing flag
		const formattedUsers = users.map((user) => ({
			id: user.id,
			username: user.profile?.username || "",
			name: user.profile?.name || "",
			bio: user.profile?.bio || "",
			avatarUrl: user.profile?.avatarUrl || "",
			followersCount: user._count.followedBy,
			followingCount: user._count.following,
			postsCount: user._count.posts,
			isFollowing: user.followedBy.length > 0,
			createdAt: user.createdAt,
		}));

		return NextResponse.json({ users: formattedUsers });
	} catch (error) {
		console.error("Error searching users:", error);
		return NextResponse.json(
			{ error: "Failed to search users" },
			{ status: 500 },
		);
	}
}
