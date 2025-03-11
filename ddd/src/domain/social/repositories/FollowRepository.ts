import type { Follow } from "../entities/Follow";

export interface FollowRepository {
	save(follow: Follow): Promise<void>;
	findByFollowerAndFollowee(
		followerId: string,
		followeeId: string,
	): Promise<Follow | null>;
	findFollowers(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ follows: Follow[]; total: number }>;
	findFollowing(
		userId: string,
		page: number,
		limit: number,
	): Promise<{ follows: Follow[]; total: number }>;
	countFollowers(userId: string): Promise<number>;
	countFollowing(userId: string): Promise<number>;
	delete(followerId: string, followeeId: string): Promise<void>;
}
