import type { UserRepository } from "@/domain/identity/repositories/UserRepository";
import type { ProfileRepository } from "@/domain/identity/repositories/ProfileRepository";
import type { PostRepository } from "@/domain/content/repositories/PostRepository";
import type { CommentRepository } from "@/domain/content/repositories/CommentRepository";
import type { LikeRepository } from "@/domain/content/repositories/LikeRepository";
import type { FollowRepository } from "@/domain/social/repositories/FollowRepository";

import { UserRepositoryImpl } from "./UserRepositoryImpl";
import { ProfileRepositoryImpl } from "./ProfileRepositoryImpl";
import { PostRepositoryImpl } from "./PostRepositoryImpl";
import { CommentRepositoryImpl } from "./CommentRepositoryImpl";
import { LikeRepositoryImpl } from "./LikeRepositoryImpl";
import { FollowRepositoryImpl } from "./FollowRepositoryImpl";

// Singleton repository instances
let userRepository: UserRepository | null = null;
let profileRepository: ProfileRepository | null = null;
let postRepository: PostRepository | null = null;
let commentRepository: CommentRepository | null = null;
let likeRepository: LikeRepository | null = null;
let followRepository: FollowRepository | null = null;

// Factory methods to get repository instances
export const getUserRepository = (): UserRepository => {
	if (!userRepository) {
		userRepository = new UserRepositoryImpl();
	}
	return userRepository;
};

export const getProfileRepository = (): ProfileRepository => {
	if (!profileRepository) {
		profileRepository = new ProfileRepositoryImpl();
	}
	return profileRepository;
};

export const getPostRepository = (): PostRepository => {
	if (!postRepository) {
		postRepository = new PostRepositoryImpl();
	}
	return postRepository;
};

export const getCommentRepository = (): CommentRepository => {
	if (!commentRepository) {
		commentRepository = new CommentRepositoryImpl();
	}
	return commentRepository;
};

export const getLikeRepository = (): LikeRepository => {
	if (!likeRepository) {
		likeRepository = new LikeRepositoryImpl();
	}
	return likeRepository;
};

export const getFollowRepository = (): FollowRepository => {
	if (!followRepository) {
		followRepository = new FollowRepositoryImpl();
	}
	return followRepository;
};
