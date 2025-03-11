export interface FollowProps {
	followerId: string;
	followeeId: string;
	createdAt: Date;
}

export class Follow {
	private props: FollowProps;

	private constructor(props: FollowProps) {
		this.props = props;
	}

	// Getters
	get followerId(): string {
		return this.props.followerId;
	}

	get followeeId(): string {
		return this.props.followeeId;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	// Domain behaviors
	public static create(followerId: string, followeeId: string): Follow {
		if (followerId === followeeId) {
			throw new Error("Users cannot follow themselves");
		}

		return new Follow({
			followerId,
			followeeId,
			createdAt: new Date(),
		});
	}

	// For database reconstruction
	public static reconstitute(props: FollowProps): Follow {
		return new Follow({
			...props,
			createdAt:
				props.createdAt instanceof Date
					? props.createdAt
					: new Date(props.createdAt),
		});
	}

	// For persistence
	public toDTO(): FollowProps {
		return { ...this.props };
	}
}
