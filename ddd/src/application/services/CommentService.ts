import { Comment } from "@/domain/content/entities/Comment";
import { ICommentRepository } from "@/domain/content/repositories/ICommentRepository";
import { IPostRepository } from "@/domain/content/repositories/IPostRepository";

interface CommentServiceOptions {
	commentRepository: ICommentRepository;
	postRepository: IPostRepository;
}

export class CommentService {
	private commentRepository: ICommentRepository;
	private postRepository: IPostRepository;

	constructor({ commentRepository, postRepository }: CommentServiceOptions) {
		this.commentRepository = commentRepository;
		this.postRepository = postRepository;
	}

	async createComment(
		postId: string,
		userId: string,
		content: string,
	): Promise<Comment> {
		// Validate the post exists
		const post = await this.postRepository.findById(postId);
		if (!post) {
			throw new Error("Post not found");
		}

		if (!content || content.trim().length === 0) {
			throw new Error("Comment content cannot be empty");
		}

		const newComment: Omit<Comment, "id"> = {
			postId,
			userId,
			content,
			createdAt: new Date(),
			updatedAt: new Date(),
			isDeleted: false,
		};

		return this.commentRepository.create(newComment);
	}

	async getCommentById(id: string): Promise<Comment | null> {
		return this.commentRepository.findById(id);
	}

	async getCommentsByPostId(
		postId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ comments: Comment[]; total: number }> {
		return this.commentRepository.findByPostId(postId, { page, limit });
	}

	async updateComment(
		id: string,
		userId: string,
		content: string,
	): Promise<Comment> {
		const comment = await this.commentRepository.findById(id);

		if (!comment) {
			throw new Error("Comment not found");
		}

		if (comment.userId !== userId) {
			throw new Error("Not authorized to update this comment");
		}

		if (!content || content.trim().length === 0) {
			throw new Error("Comment content cannot be empty");
		}

		const updatedComment = {
			...comment,
			content,
			updatedAt: new Date(),
		};

		return this.commentRepository.update(updatedComment);
	}

	async deleteComment(id: string, userId: string): Promise<void> {
		const comment = await this.commentRepository.findById(id);

		if (!comment) {
			throw new Error("Comment not found");
		}

		if (comment.userId !== userId) {
			throw new Error("Not authorized to delete this comment");
		}

		// Soft delete the comment
		const updatedComment = {
			...comment,
			isDeleted: true,
			updatedAt: new Date(),
		};

		await this.commentRepository.update(updatedComment);
	}

	async countCommentsByPostId(postId: string): Promise<number> {
		return this.commentRepository.countByPostId(postId);
	}
}
