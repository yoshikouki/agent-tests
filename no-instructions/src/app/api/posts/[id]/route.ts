import { getPost, updatePost, deletePost } from "@/lib/models/post";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for updating posts
const updatePostSchema = z.object({
	content: z
		.string()
		.min(1, "Content cannot be empty")
		.max(500, "Content is too long"),
});

// GET handler for fetching a specific post
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();
	const userId = session?.user?.id;
	const postId = params.id;

	try {
		const post = await getPost(postId, userId);

		if (!post) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		return NextResponse.json({ post });
	} catch (error) {
		console.error("Error fetching post:", error);
		return NextResponse.json(
			{ error: "Failed to fetch post" },
			{ status: 500 },
		);
	}
}

// PATCH handler for updating a post
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const postId = params.id;

	try {
		const body = await request.json();

		// Validate post content
		const validation = updatePostSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { content } = validation.data;

		// Update the post
		const post = await updatePost({
			id: postId,
			content,
			userId: session.user.id as string,
		});

		if (!post) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		return NextResponse.json({ post });
	} catch (error) {
		console.error("Error updating post:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to update post" },
			{ status: 500 },
		);
	}
}

// DELETE handler for deleting a post
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const postId = params.id;

	try {
		const success = await deletePost(postId, session.user.id as string);

		if (!success) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		return NextResponse.json(
			{ message: "Post deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting post:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to delete post" },
			{ status: 500 },
		);
	}
}
