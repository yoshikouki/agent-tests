import { createId } from "@paralleldrive/cuid2";

export interface LikeProps {
	id: string;
	userId: string;
	postId: string;
	createdAt: Date;
}

export class Like {
	private props: LikeProps;

	private constructor(props: LikeProps) {
		this.props = props;
	}

	// Getters
	get id(): string {
		return this.props.id;
	}

	get userId(): string {
		return this.props.userId;
	}

	get postId(): string {
		return this.props.postId;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	// Domain behaviors
	public static create(userId: string, postId: string): Like {
		return new Like({
			id: createId(),
			userId,
			postId,
			createdAt: new Date(),
		});
	}

	// For database reconstruction
	public static reconstitute(props: LikeProps): Like {
		return new Like({
			...props,
			createdAt:
				props.createdAt instanceof Date
					? props.createdAt
					: new Date(props.createdAt),
		});
	}

	// For persistence
	public toDTO(): LikeProps {
		return { ...this.props };
	}
}
