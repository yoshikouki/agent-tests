import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST handler for following a user
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const followingId = params.id; // The user to follow
	const followerId = session.user.id as string; // The current user

	// Cannot follow yourself
	if (followerId === followingId) {
		return NextResponse.json(
			{ error: "You cannot follow yourself" },
			{ status: 400 },
		);
	}

	try {
		const db = await getDb();

		// Check if the user to follow exists
		const userToFollow = await db.get(
			"SELECT id FROM users WHERE id = ?",
			followingId,
		);

		if (!userToFollow) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check if already following
		const existingFollow = await db.get(
			"SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
			followerId,
			followingId,
		);

		if (existingFollow) {
			return NextResponse.json(
				{ error: "Already following this user" },
				{ status: 400 },
			);
		}

		// Create the follow relationship
		const now = Math.floor(Date.now() / 1000);

		await db.run(
			"INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)",
			followerId,
			followingId,
			now,
		);

		return NextResponse.json(
			{ message: "Successfully followed user" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error following user:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to follow user" },
			{ status: 500 },
		);
	}
}

// DELETE handler for unfollowing a user
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const followingId = params.id; // The user to unfollow
	const followerId = session.user.id as string; // The current user

	try {
		const db = await getDb();

		// Delete the follow relationship if it exists
		const result = await db.run(
			"DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
			followerId,
			followingId,
		);

		if (result.changes === 0) {
			return NextResponse.json(
				{ error: "You are not following this user" },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ message: "Successfully unfollowed user" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error unfollowing user:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to unfollow user" },
			{ status: 500 },
		);
	}
}
