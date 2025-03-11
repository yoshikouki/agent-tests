import type { Like } from "../entities/Like";

export interface LikeRepository {
	save(like: Like): Promise<void>;
	findById(id: string): Promise<Like | null>;
	findByUserAndPost(userId: string, postId: string): Promise<Like | null>;
	findByPostId(
		postId: string,
		page: number,
		limit: number,
	): Promise<{ likes: Like[]; total: number }>;
	countByPostId(postId: string): Promise<number>;
	delete(id: string): Promise<void>;
	deleteByUserAndPost(userId: string, postId: string): Promise<void>;
}
