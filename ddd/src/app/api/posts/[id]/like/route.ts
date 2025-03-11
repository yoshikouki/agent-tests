import { NextResponse } from "next/server";
import { PostService } from "@/application/services/PostService";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { LikeRepositoryImpl } from "@/infrastructure/repositories/LikeRepositoryImpl";

// Like a post
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

		// Create repositories and services
		const postRepository = new PostRepositoryImpl();
		const commentRepository = new CommentRepositoryImpl();
		const likeRepository = new LikeRepositoryImpl();
		const postService = new PostService({
			postRepository,
			commentRepository,
			likeRepository,
		});

		try {
			// Like post
			await postService.likePost(postId, userId);

			// Get updated like count
			const likeCount = await postService.getPostLikes(postId);

			// Return success response
			return NextResponse.json({
				message: "Post liked successfully",
				likeCount,
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Post not found") {
					return NextResponse.json(
						{ error: "Post not found" },
						{ status: 404 },
					);
				}
				if (error.message === "Post already liked") {
					return NextResponse.json(
						{ error: "Post already liked" },
						{ status: 409 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error liking post:", error);
		return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
	}
}

// Unlike a post
export async function DELETE(
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

		// Create repositories and services
		const postRepository = new PostRepositoryImpl();
		const commentRepository = new CommentRepositoryImpl();
		const likeRepository = new LikeRepositoryImpl();
		const postService = new PostService({
			postRepository,
			commentRepository,
			likeRepository,
		});

		try {
			// Unlike post
			await postService.unlikePost(postId, userId);

			// Get updated like count
			const likeCount = await postService.getPostLikes(postId);

			// Return success response
			return NextResponse.json({
				message: "Post unliked successfully",
				likeCount,
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Like not found") {
					return NextResponse.json(
						{ error: "Post not liked yet" },
						{ status: 404 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error unliking post:", error);
		return NextResponse.json(
			{ error: "Failed to unlike post" },
			{ status: 500 },
		);
	}
}
