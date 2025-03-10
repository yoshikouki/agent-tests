import { getUserPosts } from "@/lib/models/post";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for pagination params
const paginationSchema = z.object({
	limit: z.coerce.number().int().positive().optional().default(10),
	page: z.coerce.number().int().nonnegative().optional().default(0),
});

// GET handler for fetching posts from a specific user
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();
	const currentUserId = session?.user?.id;
	const userId = params.id;

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
		const { posts, totalCount } = await getUserPosts(
			userId,
			limit,
			offset,
			currentUserId,
		);
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
		console.error("Error fetching user posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user posts" },
			{ status: 500 },
		);
	}
}
