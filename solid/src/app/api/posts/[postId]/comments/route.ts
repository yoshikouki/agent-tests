import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Schema for comment creation
const createCommentSchema = z.object({
	content: z.string().min(1).max(500),
});

// GET handler to retrieve comments for a post
export async function GET(
	request: NextRequest,
	{ params }: { params: { postId: string } },
) {
	const { postId } = params;
	const { searchParams } = new URL(request.url);

	// Pagination parameters
	const page = parseInt(searchParams.get("page") || "1");
	const limit = parseInt(searchParams.get("limit") || "10");
	const skip = (page - 1) * limit;

	try {
		// Check if post exists
		const post = await prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		// Get comments for the post with pagination
		const comments = await prisma.comment.findMany({
			where: { postId },
			include: {
				author: {
					select: {
						id: true,
						profile: {
							select: {
								username: true,
								name: true,
								avatarUrl: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		});

		// Get total count for pagination
		const total = await prisma.comment.count({
			where: { postId },
		});

		return NextResponse.json({
			comments,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching comments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch comments" },
			{ status: 500 },
		);
	}
}

// POST handler to create a new comment
export async function POST(
	request: NextRequest,
	{ params }: { params: { postId: string } },
) {
	const { postId } = params;
	const session = await getSession();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const json = await request.json();
		const validatedData = createCommentSchema.parse(json);

		// Check if post exists
		const post = await prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		// Create the comment
		const comment = await prisma.comment.create({
			data: {
				content: validatedData.content,
				postId,
				authorId: session.user.id,
			},
			include: {
				author: {
					select: {
						id: true,
						profile: {
							select: {
								username: true,
								name: true,
								avatarUrl: true,
							},
						},
					},
				},
			},
		});

		return NextResponse.json(comment, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error creating comment:", error);
		return NextResponse.json(
			{ error: "Failed to create comment" },
			{ status: 500 },
		);
	}
}
