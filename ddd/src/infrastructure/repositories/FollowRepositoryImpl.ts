import { dbAll, dbGet, dbRun } from "@/lib/db";
import type { FollowRepository } from "@/domain/social/repositories/FollowRepository";
import { Follow, type FollowProps } from "@/domain/social/entities/Follow";

// Type for database row
interface FollowRow {
	follower_id: string;
	followee_id: string;
	created_at: string;
}

export class FollowRepositoryImpl implements FollowRepository {
	async save(follow: Follow): Promise<void> {
		const dto = follow.toDTO();
		const existingFollow = await this.findByFollowerAndFollowee(
			dto.followerId,
			dto.followeeId,
		);

		if (existingFollow) {
			// Follow relationship already exists, nothing to do
			return;
		}

		// Insert new follow relationship
		await dbRun(
			`INSERT INTO follows (
        follower_id, 
        followee_id, 
        created_at
      ) VALUES (
        $followerId, 
        $followeeId, 
        $createdAt
      )`,
			{
				$followerId: dto.followerId,
				$followeeId: dto.followeeId,
				$createdAt: dto.createdAt.toISOString(),
			},
		);
	}

	async findByFollowerAndFollowee(
		followerId: string,
		followeeId: string,
	): Promise<Follow | null> {
		const row = await dbGet<FollowRow>(
			"SELECT * FROM follows WHERE follower_id = $followerId AND followee_id = $followeeId",
			{ $followerId: followerId, $followeeId: followeeId },
		);

		if (!row) return null;

		return Follow.reconstitute(this.mapRowToProps(row));
	}

	async findFollowers(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{ follows: Follow[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<FollowRow>(
			`SELECT * FROM follows 
       WHERE followee_id = $userId
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
			{
				$userId: userId,
				$limit: limit,
				$offset: offset,
			},
		);

		const total = await this.countFollowers(userId);
		const follows = rows.map((row) =>
			Follow.reconstitute(this.mapRowToProps(row)),
		);

		return { follows, total };
	}

	async findFollowing(
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{ follows: Follow[]; total: number }> {
		const offset = (page - 1) * limit;

		const rows = await dbAll<FollowRow>(
			`SELECT * FROM follows 
       WHERE follower_id = $userId
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
			{
				$userId: userId,
				$limit: limit,
				$offset: offset,
			},
		);

		const total = await this.countFollowing(userId);
		const follows = rows.map((row) =>
			Follow.reconstitute(this.mapRowToProps(row)),
		);

		return { follows, total };
	}

	async countFollowers(userId: string): Promise<number> {
		const result = await dbGet<{ count: number }>(
			"SELECT COUNT(*) as count FROM follows WHERE followee_id = $userId",
			{ $userId: userId },
		);

		return result?.count || 0;
	}

	async countFollowing(userId: string): Promise<number> {
		const result = await dbGet<{ count: number }>(
			"SELECT COUNT(*) as count FROM follows WHERE follower_id = $userId",
			{ $userId: userId },
		);

		return result?.count || 0;
	}

	async delete(followerId: string, followeeId: string): Promise<void> {
		await dbRun(
			"DELETE FROM follows WHERE follower_id = $followerId AND followee_id = $followeeId",
			{ $followerId: followerId, $followeeId: followeeId },
		);
	}

	// Helper method to map database row to FollowProps
	private mapRowToProps(row: FollowRow): FollowProps {
		return {
			followerId: row.follower_id,
			followeeId: row.followee_id,
			createdAt: new Date(row.created_at),
		};
	}
}
