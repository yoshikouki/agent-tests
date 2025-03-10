import { createPost, getFeedPosts } from "@/lib/models/post";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for creating posts
const createPostSchema = z.object({
	content: z
		.string()
		.min(1, "Content cannot be empty")
		.max(500, "Content is too long"),
});

// Schema for pagination params
const paginationSchema = z.object({
	limit: z.coerce.number().int().positive().optional().default(10),
	page: z.coerce.number().int().nonnegative().optional().default(0),
});

// GET handler for fetching posts
export async function GET(request: NextRequest) {
	const session = await auth();
	const userId = session?.user?.id;

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
		const { posts, totalCount } = await getFeedPosts(limit, offset, userId);
		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			posts,
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
		console.error("Error fetching posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch posts" },
			{ status: 500 },
		);
	}
}

// POST handler for creating new posts
export async function POST(request: NextRequest) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();

		// Validate post content
		const validation = createPostSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { content } = validation.data;

		// Create the post
		const post = await createPost({
			content,
			userId: session.user.id as string,
		});

		return NextResponse.json({ post }, { status: 201 });
	} catch (error) {
		console.error("Error creating post:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to create post" },
			{ status: 500 },
		);
	}
}
