import { NextResponse } from "next/server";
import { PostService } from "@/application/services/PostService";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { LikeRepositoryImpl } from "@/infrastructure/repositories/LikeRepositoryImpl";

// Get a post by ID
export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const postId = params.id;

		// Create repositories and services
		const postRepository = new PostRepositoryImpl();
		const commentRepository = new CommentRepositoryImpl();
		const likeRepository = new LikeRepositoryImpl();
		const postService = new PostService({
			postRepository,
			commentRepository,
			likeRepository,
		});

		// Get post
		const post = await postService.getPostById(postId);

		if (!post) {
			return NextResponse.json({ error: "Post not found" }, { status: 404 });
		}

		// Get like and comment counts
		const likeCount = await postService.getPostLikes(postId);
		const commentCount = await commentRepository.countByPostId(postId);

		// Check if current user has liked the post (if authenticated)
		const userId = request.headers.get("x-user-id");
		let userHasLiked = false;

		if (userId) {
			userHasLiked = await postService.hasUserLikedPost(postId, userId);
		}

		// Return post with additional information
		return NextResponse.json({
			post: {
				id: post.id,
				content: post.content,
				userId: post.userId,
				createdAt: post.createdAt,
				updatedAt: post.updatedAt,
				likeCount,
				commentCount,
				userHasLiked,
			},
		});
	} catch (error) {
		console.error("Error fetching post:", error);
		return NextResponse.json(
			{ error: "Failed to fetch post" },
			{ status: 500 },
		);
	}
}

// Update a post
export async function PATCH(
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
		const postRepository = new PostRepositoryImpl();
		const commentRepository = new CommentRepositoryImpl();
		const likeRepository = new LikeRepositoryImpl();
		const postService = new PostService({
			postRepository,
			commentRepository,
			likeRepository,
		});

		try {
			// Update post
			const updatedPost = await postService.updatePost(postId, userId, content);

			// Return updated post
			return NextResponse.json({
				message: "Post updated successfully",
				post: {
					id: updatedPost.id,
					content: updatedPost.content,
					userId: updatedPost.userId,
					createdAt: updatedPost.createdAt,
					updatedAt: updatedPost.updatedAt,
				},
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Post not found") {
					return NextResponse.json(
						{ error: "Post not found" },
						{ status: 404 },
					);
				}
				if (error.message === "Not authorized to update this post") {
					return NextResponse.json(
						{ error: "Not authorized to update this post" },
						{ status: 403 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error updating post:", error);
		return NextResponse.json(
			{ error: "Failed to update post" },
			{ status: 500 },
		);
	}
}

// Delete a post
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
			// Delete post
			await postService.deletePost(postId, userId);

			// Return success response
			return NextResponse.json({
				message: "Post deleted successfully",
			});
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Post not found") {
					return NextResponse.json(
						{ error: "Post not found" },
						{ status: 404 },
					);
				}
				if (error.message === "Not authorized to delete this post") {
					return NextResponse.json(
						{ error: "Not authorized to delete this post" },
						{ status: 403 },
					);
				}
			}
			throw error;
		}
	} catch (error) {
		console.error("Error deleting post:", error);
		return NextResponse.json(
			{ error: "Failed to delete post" },
			{ status: 500 },
		);
	}
}
