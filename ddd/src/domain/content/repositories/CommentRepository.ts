import type { Comment } from "../entities/Comment";

export interface CommentRepository {
	save(comment: Comment): Promise<void>;
	findById(id: string): Promise<Comment | null>;
	findByPostId(
		postId: string,
		page: number,
		limit: number,
	): Promise<{ comments: Comment[]; total: number }>;
	findByAuthorId(
		authorId: string,
		page: number,
		limit: number,
	): Promise<{ comments: Comment[]; total: number }>;
	delete(id: string): Promise<void>;
}
