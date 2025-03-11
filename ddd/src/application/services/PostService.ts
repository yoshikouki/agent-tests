import { Post } from "@/domain/content/entities/Post";
import { IPostRepository } from "@/domain/content/repositories/IPostRepository";
import { ILikeRepository } from "@/domain/content/repositories/ILikeRepository";
import { ICommentRepository } from "@/domain/content/repositories/ICommentRepository";

interface PostServiceOptions {
	postRepository: IPostRepository;
	likeRepository: ILikeRepository;
	commentRepository: ICommentRepository;
}

export class PostService {
	private postRepository: IPostRepository;
	private likeRepository: ILikeRepository;
	private commentRepository: ICommentRepository;

	constructor({
		postRepository,
		likeRepository,
		commentRepository,
	}: PostServiceOptions) {
		this.postRepository = postRepository;
		this.likeRepository = likeRepository;
		this.commentRepository = commentRepository;
	}

	async createPost(userId: string, content: string): Promise<Post> {
		if (!content || content.trim().length === 0) {
			throw new Error("Post content cannot be empty");
		}

		const newPost: Omit<Post, "id"> = {
			userId,
			content,
			createdAt: new Date(),
			updatedAt: new Date(),
			isDeleted: false,
		};

		return this.postRepository.create(newPost);
	}

	async getPostById(id: string): Promise<Post | null> {
		return this.postRepository.findById(id);
	}

	async updatePost(id: string, userId: string, content: string): Promise<Post> {
		const post = await this.postRepository.findById(id);

		if (!post) {
			throw new Error("Post not found");
		}

		if (post.userId !== userId) {
			throw new Error("Not authorized to update this post");
		}

		if (!content || content.trim().length === 0) {
			throw new Error("Post content cannot be empty");
		}

		const updatedPost = {
			...post,
			content,
			updatedAt: new Date(),
		};

		return this.postRepository.update(updatedPost);
	}

	async deletePost(id: string, userId: string): Promise<void> {
		const post = await this.postRepository.findById(id);

		if (!post) {
			throw new Error("Post not found");
		}

		if (post.userId !== userId) {
			throw new Error("Not authorized to delete this post");
		}

		// Soft delete the post
		const updatedPost = {
			...post,
			isDeleted: true,
			updatedAt: new Date(),
		};

		await this.postRepository.update(updatedPost);
	}

	async getFeed(
		page: number = 1,
		limit: number = 10,
	): Promise<{ posts: Post[]; total: number }> {
		return this.postRepository.findAll({ page, limit });
	}

	async getUserPosts(
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ posts: Post[]; total: number }> {
		return this.postRepository.findByUserId(userId, { page, limit });
	}

	async likePost(postId: string, userId: string): Promise<void> {
		const post = await this.postRepository.findById(postId);

		if (!post) {
			throw new Error("Post not found");
		}

		const existingLike = await this.likeRepository.findByPostAndUser(
			postId,
			userId,
		);

		if (existingLike) {
			throw new Error("Post already liked");
		}

		await this.likeRepository.create({
			postId,
			userId,
			createdAt: new Date(),
		});
	}

	async unlikePost(postId: string, userId: string): Promise<void> {
		const like = await this.likeRepository.findByPostAndUser(postId, userId);

		if (!like) {
			throw new Error("Like not found");
		}

		await this.likeRepository.delete(like.id);
	}

	async getPostLikes(postId: string): Promise<number> {
		return this.likeRepository.countByPostId(postId);
	}

	async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
		const like = await this.likeRepository.findByPostAndUser(postId, userId);
		return !!like;
	}
}
