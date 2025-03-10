import { getPostComments, createComment } from "@/lib/models/comment";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for creating comments
const createCommentSchema = z.object({
	content: z
		.string()
		.min(1, "Comment cannot be empty")
		.max(500, "Comment is too long"),
});

// Schema for pagination params
const paginationSchema = z.object({
	limit: z.coerce.number().int().positive().optional().default(20),
	page: z.coerce.number().int().nonnegative().optional().default(0),
});

// GET handler for fetching comments
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const postId = params.id;

	// Parse pagination params
	const searchParams = request.nextUrl.searchParams;
	const validation = paginationSchema.safeParse({
		limit: searchParams.get("limit"),
		page: searchParams.get("page"),
	});

	if (!validation.success) {
		return NextResponse.json(
			{ error: "Invalid pagination parameters" },
			{ status: 400 },
		);
	}

	const { limit, page } = validation.data;
	const offset = page * limit;

	try {
		const { comments, totalCount } = await getPostComments(
			postId,
			limit,
			offset,
		);
		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			comments,
			pagination: {
				total: totalCount,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages - 1,
				hasPrevPage: page > 0,
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

// POST handler for creating new comments
export async function POST(
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

		// Validate comment content
		const validation = createCommentSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { content } = validation.data;

		// Create the comment
		const comment = await createComment({
			content,
			postId,
			userId: session.user.id as string,
		});

		return NextResponse.json({ comment }, { status: 201 });
	} catch (error) {
		console.error("Error creating comment:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to create comment" },
			{ status: 500 },
		);
	}
}
