import { dbAll, dbGet, dbRun } from "@/lib/db";
import type { LikeRepository } from "@/domain/content/repositories/LikeRepository";
import { Like, type LikeProps } from "@/domain/content/entities/Like";

// Type for database row
interface LikeRow {
	id: string;
	user_id: string;
	post_id: string;
	created_at: string;
}

export class LikeRepositoryImpl implements LikeRepository {
	async save(like: Like): Promise<void> {
		const dto = like.toDTO();
		const existingLike = await this.findByUserAndPost(dto.userId, dto.postId);

		if (existingLike) {
			// Like already exists, nothing to do
			return;
		}

		// Insert new like
		await dbRun(
			`INSERT INTO likes (
				id, 
				user_id, 
				post_id, 
				created_at
			) VALUES (
				$id, 
				$userId, 
				$postId, 
				$createdAt
			)`,
			{
				$id: dto.id,
				$userId: dto.userId,
				$postId: dto.postId,
				$createdAt: dto.createdAt.toISOString(),
			},
		);
	}

	async findById(id: string): Promise<Like | null> {
		const row = await dbGet<LikeRow>("SELECT * FROM likes WHERE id = $id", {
			$id: id,
		});

		if (!row) return null;

		return Like.reconstitute(this.mapRowToProps(row));
	}

	async findByUserAndPost(
		userId: string,
		postId: string,
	): Promise<Like | null> {
		const row = await dbGet<LikeRow>(
			"SELECT * FROM likes WHERE user_id = $userId AND post_id = $postId",
			{ $userId: userId, $postId: postId },
		);

		if (!row) return null;

		return Like.reconstitute(this.mapRowToProps(row));
	}

	async findByPostId(
		postId: string,
		page = 1,
		limit = 10,
	): Promise<{ likes: Like[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<LikeRow>(
			`SELECT * FROM likes 
       WHERE post_id = $postId
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
			{
				$postId: postId,
				$limit: limit,
				$offset: offset,
			},
		);

		const total = await this.countByPostId(postId);
		const likes = rows.map((row) => Like.reconstitute(this.mapRowToProps(row)));

		return { likes, total };
	}

	async countByPostId(postId: string): Promise<number> {
		const result = await dbGet<{ count: number }>(
			"SELECT COUNT(*) as count FROM likes WHERE post_id = $postId",
			{ $postId: postId },
		);

		return result?.count || 0;
	}

	async delete(id: string): Promise<void> {
		await dbRun("DELETE FROM likes WHERE id = $id", { $id: id });
	}

	async deleteByUserAndPost(userId: string, postId: string): Promise<void> {
		await dbRun(
			"DELETE FROM likes WHERE user_id = $userId AND post_id = $postId",
			{ $userId: userId, $postId: postId },
		);
	}

	// Helper method to map database row to LikeProps
	private mapRowToProps(row: LikeRow): LikeProps {
		return {
			id: row.id,
			userId: row.user_id,
			postId: row.post_id,
			createdAt: new Date(row.created_at),
		};
	}
}
