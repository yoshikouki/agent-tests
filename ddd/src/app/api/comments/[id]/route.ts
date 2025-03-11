import { NextResponse } from "next/server";
import { CommentService } from "@/application/services/CommentService";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";

// Update a comment
export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const commentId = params.id;

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
			// Update comment
			const updatedComment = await commentService.updateComment(
				commentId,
				userId,
				content,
			);

			// Return updated comment
			return NextResponse.json({
				message: "Comment updated successfully",
				comment: {
					id: updatedComment.id,
					content: updatedComment.content,
					postId: updatedComment.postId,
					userId: updatedComment.userId,
					createdAt: updatedComment.createdAt,
					updatedAt: updatedComment.updatedAt,
				},
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Comment not found") {
					return NextResponse.json(
						{ error: "Comment not found" },
						{ status: 404 },
					);
				}
				if (error.message === "Not authorized to update this comment") {
					return NextResponse.json(
						{ error: "Not authorized to update this comment" },
						{ status: 403 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error updating comment:", error);
		return NextResponse.json(
			{ error: "Failed to update comment" },
			{ status: 500 },
		);
	}
}

// Delete a comment
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const commentId = params.id;

		// Get user ID from request headers (set by middleware)
		const userId = request.headers.get("x-user-id");

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Create repositories and services
		const commentRepository = new CommentRepositoryImpl();
		const postRepository = new PostRepositoryImpl();
		const commentService = new CommentService({
			commentRepository,
			postRepository,
		});

		try {
			// Delete comment
			await commentService.deleteComment(commentId, userId);

			// Return success response
			return NextResponse.json({
				message: "Comment deleted successfully",
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Comment not found") {
					return NextResponse.json(
						{ error: "Comment not found" },
						{ status: 404 },
					);
				}
				if (error.message === "Not authorized to delete this comment") {
					return NextResponse.json(
						{ error: "Not authorized to delete this comment" },
						{ status: 403 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json(
			{ error: "Failed to delete comment" },
			{ status: 500 },
		);
	}
}
