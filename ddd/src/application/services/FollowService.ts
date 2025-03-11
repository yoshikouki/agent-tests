import { Follow } from "@/domain/social/entities/Follow";
import { IFollowRepository } from "@/domain/social/repositories/IFollowRepository";
import { IUserRepository } from "@/domain/identity/repositories/IUserRepository";

interface FollowServiceOptions {
	followRepository: IFollowRepository;
	userRepository: IUserRepository;
}

export class FollowService {
	private followRepository: IFollowRepository;
	private userRepository: IUserRepository;

	constructor({ followRepository, userRepository }: FollowServiceOptions) {
		this.followRepository = followRepository;
		this.userRepository = userRepository;
	}

	async followUser(followerId: string, followedId: string): Promise<void> {
		// Validate users exist
		const follower = await this.userRepository.findById(followerId);
		const followed = await this.userRepository.findById(followedId);

		if (!follower || !followed) {
			throw new Error("User not found");
		}

		if (followerId === followedId) {
			throw new Error("Cannot follow yourself");
		}

		// Check if already following
		const existingFollow =
			await this.followRepository.findByFollowerAndFollowed(
				followerId,
				followedId,
			);

		if (existingFollow) {
			throw new Error("Already following this user");
		}

		await this.followRepository.create({
			followerId,
			followedId,
			createdAt: new Date(),
		});
	}

	async unfollowUser(followerId: string, followedId: string): Promise<void> {
		const follow = await this.followRepository.findByFollowerAndFollowed(
			followerId,
			followedId,
		);

		if (!follow) {
			throw new Error("Not following this user");
		}

		await this.followRepository.delete(follow.id);
	}

	async getFollowers(
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ users: string[]; total: number }> {
		return this.followRepository.findFollowers(userId, { page, limit });
	}

	async getFollowing(
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ users: string[]; total: number }> {
		return this.followRepository.findFollowing(userId, { page, limit });
	}

	async isFollowing(followerId: string, followedId: string): Promise<boolean> {
		const follow = await this.followRepository.findByFollowerAndFollowed(
			followerId,
			followedId,
		);
		return !!follow;
	}

	async getFollowersCount(userId: string): Promise<number> {
		return this.followRepository.countFollowers(userId);
	}

	async getFollowingCount(userId: string): Promise<number> {
		return this.followRepository.countFollowing(userId);
	}
}
