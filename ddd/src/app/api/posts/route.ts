import { NextResponse } from "next/server";
import { PostService } from "@/application/services/PostService";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { LikeRepositoryImpl } from "@/infrastructure/repositories/LikeRepositoryImpl";

// Create a new post
export async function POST(request: Request) {
	try {
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

		// Create post
		const post = await postService.createPost(userId, content);

		// Return created post
		return NextResponse.json(
			{
				message: "Post created successfully",
				post: {
					id: post.id,
					content: post.content,
					userId: post.userId,
					createdAt: post.createdAt,
					updatedAt: post.updatedAt,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating post:", error);
		return NextResponse.json(
			{ error: "Failed to create post" },
			{ status: 500 },
		);
	}
}

// Get feed of posts
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");

		// Create repositories and services
		const postRepository = new PostRepositoryImpl();
		const commentRepository = new CommentRepositoryImpl();
		const likeRepository = new LikeRepositoryImpl();
		const postService = new PostService({
			postRepository,
			commentRepository,
			likeRepository,
		});

		// Get feed
		const { posts, total } = await postService.getFeed(page, limit);

		// Process posts to include comment and like counts
		const processedPosts = await Promise.all(
			posts.map(async (post) => {
				const likeCount = await postService.getPostLikes(post.id);
				const commentCount = await commentRepository.countByPostId(post.id);

				return {
					id: post.id,
					content: post.content,
					userId: post.userId,
					createdAt: post.createdAt,
					updatedAt: post.updatedAt,
					likeCount,
					commentCount,
				};
			}),
		);

		// Return posts
		return NextResponse.json({
			posts: processedPosts,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Error fetching posts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch posts" },
			{ status: 500 },
		);
	}
}
