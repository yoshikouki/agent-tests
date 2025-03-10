import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export interface Post {
	id: string;
	content: string;
	userId: string;
	userName: string;
	userImage?: string;
	createdAt: Date;
	updatedAt: Date;
	likeCount: number;
	commentCount: number;
	hasLiked?: boolean;
}

export interface CreatePostInput {
	content: string;
	userId: string;
}

export interface UpdatePostInput {
	id: string;
	content: string;
	userId: string; // Used for authorization
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
	const db = await getDb();

	const postId = uuid();
	const now = Math.floor(Date.now() / 1000); // Unix timestamp

	await db.run(
		"INSERT INTO posts (id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
		postId,
		input.userId,
		input.content,
		now,
		now,
	);

	// Get the user details for the post
	const user = await db.get(
		"SELECT name, image_url FROM users WHERE id = ?",
		input.userId,
	);

	return {
		id: postId,
		content: input.content,
		userId: input.userId,
		userName: user?.name || "Unknown User",
		userImage: user?.image_url,
		createdAt: new Date(now * 1000),
		updatedAt: new Date(now * 1000),
		likeCount: 0,
		commentCount: 0,
		hasLiked: false,
	};
}

/**
 * Get a post by ID
 */
export async function getPost(
	postId: string,
	currentUserId?: string,
): Promise<Post | null> {
	const db = await getDb();

	const post = await db.get(
		`
    SELECT 
      p.*,
      u.name as user_name,
      u.image_url as user_image,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
      CASE WHEN ? IS NOT NULL THEN 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) > 0
      ELSE
        0
      END as has_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `,
		currentUserId,
		currentUserId,
		postId,
	);

	if (!post) {
		return null;
	}

	return {
		id: post.id,
		content: post.content,
		userId: post.user_id,
		userName: post.user_name,
		userImage: post.user_image,
		createdAt: new Date(post.created_at * 1000),
		updatedAt: new Date(post.updated_at * 1000),
		likeCount: post.like_count,
		commentCount: post.comment_count,
		hasLiked: !!post.has_liked,
	};
}

/**
 * Update a post
 */
export async function updatePost(input: UpdatePostInput): Promise<Post | null> {
	const db = await getDb();

	// First check if post exists and if the user is authorized
	const existingPost = await db.get(
		"SELECT * FROM posts WHERE id = ?",
		input.id,
	);

	if (!existingPost) {
		return null;
	}

	if (existingPost.user_id !== input.userId) {
		throw new Error("Not authorized to update this post");
	}

	const now = Math.floor(Date.now() / 1000);

	await db.run(
		"UPDATE posts SET content = ?, updated_at = ? WHERE id = ?",
		input.content,
		now,
		input.id,
	);

	// Get the updated post
	return getPost(input.id, input.userId);
}

/**
 * Delete a post
 */
export async function deletePost(
	postId: string,
	userId: string,
): Promise<boolean> {
	const db = await getDb();

	// First check if post exists and if the user is authorized
	const existingPost = await db.get("SELECT * FROM posts WHERE id = ?", postId);

	if (!existingPost) {
		return false;
	}

	if (existingPost.user_id !== userId) {
		throw new Error("Not authorized to delete this post");
	}

	await db.run("DELETE FROM posts WHERE id = ?", postId);

	return true;
}

/**
 * Get all posts for the feed/timeline with pagination
 */
export async function getFeedPosts(
	limit: number = 10,
	offset: number = 0,
	currentUserId?: string,
): Promise<{ posts: Post[]; totalCount: number }> {
	const db = await getDb();

	const posts = await db.all(
		`
    SELECT 
      p.*,
      u.name as user_name,
      u.image_url as user_image,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
      CASE WHEN ? IS NOT NULL THEN 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) > 0
      ELSE
        0
      END as has_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `,
		currentUserId,
		currentUserId,
		limit,
		offset,
	);

	// Get total count for pagination
	const result = await db.get("SELECT COUNT(*) as count FROM posts");
	const totalCount = result ? result.count : 0;

	return {
		posts: posts.map((post) => ({
			id: post.id,
			content: post.content,
			userId: post.user_id,
			userName: post.user_name,
			userImage: post.user_image,
			createdAt: new Date(post.created_at * 1000),
			updatedAt: new Date(post.updated_at * 1000),
			likeCount: post.like_count,
			commentCount: post.comment_count,
			hasLiked: !!post.has_liked,
		})),
		totalCount,
	};
}

/**
 * Get posts for a specific user with pagination
 */
export async function getUserPosts(
	userId: string,
	limit: number = 10,
	offset: number = 0,
	currentUserId?: string,
): Promise<{ posts: Post[]; totalCount: number }> {
	const db = await getDb();

	const posts = await db.all(
		`
    SELECT 
      p.*,
      u.name as user_name,
      u.image_url as user_image,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
      CASE WHEN ? IS NOT NULL THEN 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) > 0
      ELSE
        0
      END as has_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `,
		currentUserId,
		currentUserId,
		userId,
		limit,
		offset,
	);

	// Get total count for pagination
	const result = await db.get(
		"SELECT COUNT(*) as count FROM posts WHERE user_id = ?",
		userId,
	);
	const totalCount = result ? result.count : 0;

	return {
		posts: posts.map((post) => ({
			id: post.id,
			content: post.content,
			userId: post.user_id,
			userName: post.user_name,
			userImage: post.user_image,
			createdAt: new Date(post.created_at * 1000),
			updatedAt: new Date(post.updated_at * 1000),
			likeCount: post.like_count,
			commentCount: post.comment_count,
			hasLiked: !!post.has_liked,
		})),
		totalCount,
	};
}
