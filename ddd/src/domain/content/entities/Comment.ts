import { createId } from "@paralleldrive/cuid2";

export interface CommentProps {
	id: string;
	postId: string;
	authorId: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

export class Comment {
	private props: CommentProps;

	private constructor(props: CommentProps) {
		this.props = props;
	}

	// Getters
	get id(): string {
		return this.props.id;
	}

	get postId(): string {
		return this.props.postId;
	}

	get authorId(): string {
		return this.props.authorId;
	}

	get content(): string {
		return this.props.content;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	// Domain behaviors
	public static create(
		postId: string,
		authorId: string,
		content: string,
	): Comment {
		if (!content || content.trim().length === 0) {
			throw new Error("Comment content cannot be empty");
		}

		const now = new Date();

		return new Comment({
			id: createId(),
			postId,
			authorId,
			content,
			createdAt: now,
			updatedAt: now,
		});
	}

	public updateContent(content: string): void {
		if (!content || content.trim().length === 0) {
			throw new Error("Comment content cannot be empty");
		}

		this.props.content = content;
		this.props.updatedAt = new Date();
	}

	// Validation: only the author can modify the comment
	public canBeModifiedBy(userId: string): boolean {
		return this.props.authorId === userId;
	}

	// For database reconstruction
	public static reconstitute(props: CommentProps): Comment {
		return new Comment({
			...props,
			createdAt:
				props.createdAt instanceof Date
					? props.createdAt
					: new Date(props.createdAt),
			updatedAt:
				props.updatedAt instanceof Date
					? props.updatedAt
					: new Date(props.updatedAt),
		});
	}

	// For persistence
	public toDTO(): CommentProps {
		return { ...this.props };
	}
}
