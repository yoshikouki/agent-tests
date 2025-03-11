import type { Post } from "../entities/Post";

export interface PostRepository {
	save(post: Post): Promise<void>;
	findById(id: string): Promise<Post | null>;
	findByAuthorId(
		authorId: string,
		page: number,
		limit: number,
	): Promise<{ posts: Post[]; total: number }>;
	findAll(
		page: number,
		limit: number,
	): Promise<{ posts: Post[]; total: number }>;
	findByUserFeed(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ posts: Post[]; total: number }>;
	delete(id: string): Promise<void>;
}
