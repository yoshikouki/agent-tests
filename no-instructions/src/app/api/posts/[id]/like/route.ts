import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// POST handler for liking a post
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const postId = params.id;
	const userId = session.user.id as string;

	try {
		const db = await getDb();

		// Check if post exists
		const post = await db.get("SELECT * FROM posts WHERE id = ?", postId);

		if (!post) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		// Check if user already liked the post
		const existingLike = await db.get(
			"SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
			userId,
			postId,
		);

		if (existingLike) {
			return NextResponse.json(
				{ error: "Already liked this post" },
				{ status: 400 },
			);
		}

		// Create the like
		const likeId = uuid();
		const now = Math.floor(Date.now() / 1000);

		await db.run(
			"INSERT INTO likes (id, user_id, post_id, created_at) VALUES (?, ?, ?, ?)",
			likeId,
			userId,
			postId,
			now,
		);

		// Get the new like count
		const likeCount = await db.get(
			"SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
			postId,
		);

		return NextResponse.json({
			message: "Post liked successfully",
			likeCount: likeCount?.count || 1,
		});
	} catch (error) {
		console.error("Error liking post:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
	}
}

// DELETE handler for unliking a post
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const postId = params.id;
	const userId = session.user.id as string;

	try {
		const db = await getDb();

		// Delete the like if it exists
		const result = await db.run(
			"DELETE FROM likes WHERE user_id = ? AND post_id = ?",
			userId,
			postId,
		);

		if (result.changes === 0) {
			return NextResponse.json(
				{ error: "You have not liked this post" },
				{ status: 400 },
			);
		}

		// Get the new like count
		const likeCount = await db.get(
			"SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
			postId,
		);

		return NextResponse.json({
			message: "Post unliked successfully",
			likeCount: likeCount?.count || 0,
		});
	} catch (error) {
		console.error("Error unliking post:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to unlike post" },
			{ status: 500 },
		);
	}
}
