export interface ProfileProps {
	userId: string;
	displayName: string | null;
	bio: string | null;
	avatarUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export class Profile {
	private props: ProfileProps;

	private constructor(props: ProfileProps) {
		this.props = props;
	}

	// Getters
	get userId(): string {
		return this.props.userId;
	}

	get displayName(): string | null {
		return this.props.displayName;
	}

	get bio(): string | null {
		return this.props.bio;
	}

	get avatarUrl(): string | null {
		return this.props.avatarUrl;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	// Domain behaviors
	public static create(userId: string): Profile {
		const now = new Date();

		return new Profile({
			userId,
			displayName: null,
			bio: null,
			avatarUrl: null,
			createdAt: now,
			updatedAt: now,
		});
	}

	public updateDisplayName(displayName: string | null): void {
		this.props.displayName = displayName;
		this.props.updatedAt = new Date();
	}

	public updateBio(bio: string | null): void {
		this.props.bio = bio;
		this.props.updatedAt = new Date();
	}

	public updateAvatarUrl(avatarUrl: string | null): void {
		this.props.avatarUrl = avatarUrl;
		this.props.updatedAt = new Date();
	}

	// For database reconstruction
	public static reconstitute(props: ProfileProps): Profile {
		return new Profile({
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
	public toDTO(): ProfileProps {
		return { ...this.props };
	}
}
