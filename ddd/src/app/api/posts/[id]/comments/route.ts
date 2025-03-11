import { NextResponse } from "next/server";
import { CommentService } from "@/application/services/CommentService";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";

// Create a comment for a post
export async function POST(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const postId = params.id;

		// Get user ID from request headers (set by middleware)
		const userId = request.headers.get("x-user-id");

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		const { content } = body;

		if (!content) {
			return NextResponse.json(
				{ error: "Content is required" },
				{ status: 400 },
			);
		}

		// Create repositories and services
		const commentRepository = new CommentRepositoryImpl();
		const postRepository = new PostRepositoryImpl();
		const commentService = new CommentService({
			commentRepository,
			postRepository,
		});

		try {
			// Create comment
			const comment = await commentService.createComment(
				postId,
				userId,
				content,
			);

			// Return created comment
			return NextResponse.json(
				{
					message: "Comment created successfully",
					comment: {
						id: comment.id,
						content: comment.content,
						postId: comment.postId,
						userId: comment.userId,
						createdAt: comment.createdAt,
						updatedAt: comment.updatedAt,
					},
				},
				{ status: 201 },
			);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Post not found") {
					return NextResponse.json(
						{ error: "Post not found" },
						{ status: 404 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error creating comment:", error);
		return NextResponse.json(
			{ error: "Failed to create comment" },
			{ status: 500 },
		);
	}
}

// Get comments for a post
export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const postId = params.id;
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1", 10);
		const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

		// Create repositories and services
		const commentRepository = new CommentRepositoryImpl();
		const postRepository = new PostRepositoryImpl();
		const commentService = new CommentService({
			commentRepository,
			postRepository,
		});

		// Check if post exists
		const postExists = await postRepository.findById(postId);

		if (!postExists) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		// Get comments
		const { comments, total } = await commentService.getCommentsByPostId(
			postId,
			page,
			limit,
		);

		// Process comments for response
		const processedComments = comments.map((comment) => ({
			id: comment.id,
			content: comment.content,
			postId: comment.postId,
			userId: comment.userId,
			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
		}));

		// Return comments
		return NextResponse.json({
			comments: processedComments,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error fetching comments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch comments" },
			{ status: 500 },
		);
	}
}
