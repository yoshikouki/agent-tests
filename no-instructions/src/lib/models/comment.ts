import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export interface Comment {
	id: string;
	content: string;
	postId: string;
	userId: string;
	userName: string;
	userImage?: string;
	createdAt: Date;
}

export interface CreateCommentInput {
	content: string;
	postId: string;
	userId: string;
}

/**
 * Create a new comment
 */
export async function createComment(
	input: CreateCommentInput,
): Promise<Comment> {
	const db = await getDb();

	const commentId = uuid();
	const now = Math.floor(Date.now() / 1000); // Unix timestamp

	await db.run(
		"INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
		commentId,
		input.postId,
		input.userId,
		input.content,
		now,
	);

	// Get the user details for the comment
	const user = await db.get(
		"SELECT name, image_url FROM users WHERE id = ?",
		input.userId,
	);

	return {
		id: commentId,
		content: input.content,
		postId: input.postId,
		userId: input.userId,
		userName: user?.name || "Unknown User",
		userImage: user?.image_url,
		createdAt: new Date(now * 1000),
	};
}

/**
 * Delete a comment
 */
export async function deleteComment(
	commentId: string,
	userId: string,
): Promise<boolean> {
	const db = await getDb();

	// First check if comment exists and if the user is authorized
	const existingComment = await db.get(
		"SELECT * FROM comments WHERE id = ?",
		commentId,
	);

	if (!existingComment) {
		return false;
	}

	if (existingComment.user_id !== userId) {
		throw new Error("Not authorized to delete this comment");
	}

	await db.run("DELETE FROM comments WHERE id = ?", commentId);

	return true;
}

/**
 * Get comments for a post with pagination
 */
export async function getPostComments(
	postId: string,
	limit: number = 20,
	offset: number = 0,
): Promise<{ comments: Comment[]; totalCount: number }> {
	const db = await getDb();

	const comments = await db.all(
		`
    SELECT 
      c.*,
      u.name as user_name,
      u.image_url as user_image
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `,
		postId,
		limit,
		offset,
	);

	// Get total count for pagination
	const result = await db.get(
		"SELECT COUNT(*) as count FROM comments WHERE post_id = ?",
		postId,
	);
	const totalCount = result ? result.count : 0;

	return {
		comments: comments.map((comment) => ({
			id: comment.id,
			content: comment.content,
			postId: comment.post_id,
			userId: comment.user_id,
			userName: comment.user_name,
			userImage: comment.user_image,
			createdAt: new Date(comment.created_at * 1000),
		})),
		totalCount,
	};
}
