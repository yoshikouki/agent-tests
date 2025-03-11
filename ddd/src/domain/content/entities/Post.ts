import { createId } from "@paralleldrive/cuid2";

export interface PostProps {
	id: string;
	authorId: string;
	content: string;
	attachments: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class Post {
	private props: PostProps;

	private constructor(props: PostProps) {
		this.props = props;
	}

	// Getters
	get id(): string {
		return this.props.id;
	}

	get authorId(): string {
		return this.props.authorId;
	}

	get content(): string {
		return this.props.content;
	}

	get attachments(): string[] | null {
		return this.props.attachments ? JSON.parse(this.props.attachments) : null;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	// Domain behaviors
	public static create(
		authorId: string,
		content: string,
		attachments: string[] | null = null,
	): Post {
		if (!content || content.trim().length === 0) {
			throw new Error("Post content cannot be empty");
		}

		const now = new Date();

		return new Post({
			id: createId(),
			authorId,
			content,
			attachments: attachments ? JSON.stringify(attachments) : null,
			createdAt: now,
			updatedAt: now,
		});
	}

	public updateContent(content: string): void {
		if (!content || content.trim().length === 0) {
			throw new Error("Post content cannot be empty");
		}

		this.props.content = content;
		this.props.updatedAt = new Date();
	}

	public updateAttachments(attachments: string[] | null): void {
		this.props.attachments = attachments ? JSON.stringify(attachments) : null;
		this.props.updatedAt = new Date();
	}

	// Validation: only the author can modify the post
	public canBeModifiedBy(userId: string): boolean {
		return this.props.authorId === userId;
	}

	// For database reconstruction
	public static reconstitute(props: PostProps): Post {
		return new Post({
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
	public toDTO(): PostProps {
		return { ...this.props };
	}
}
