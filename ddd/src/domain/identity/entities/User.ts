import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";

export interface UserProps {
	id: string;
	username: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
}

export class User {
	private props: UserProps;

	private constructor(props: UserProps) {
		this.props = props;
	}

	// Getters
	get id(): string {
		return this.props.id;
	}

	get username(): string {
		return this.props.username;
	}

	get email(): string {
		return this.props.email;
	}

	get passwordHash(): string {
		return this.props.passwordHash;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	// Domain behaviors
	public static async create(
		username: string,
		email: string,
		password: string,
	): Promise<User> {
		if (!username || username.length < 3) {
			throw new Error("Username must be at least 3 characters");
		}

		if (!email || !email.includes("@")) {
			throw new Error("Valid email is required");
		}

		if (!password || password.length < 8) {
			throw new Error("Password must be at least 8 characters");
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const now = new Date();

		return new User({
			id: createId(),
			username,
			email,
			passwordHash,
			createdAt: now,
			updatedAt: now,
		});
	}

	public async verifyPassword(password: string): Promise<boolean> {
		return bcrypt.compare(password, this.props.passwordHash);
	}

	public changeEmail(newEmail: string): void {
		if (!newEmail || !newEmail.includes("@")) {
			throw new Error("Valid email is required");
		}

		this.props.email = newEmail;
		this.props.updatedAt = new Date();
	}

	public async changePassword(newPassword: string): Promise<void> {
		if (!newPassword || newPassword.length < 8) {
			throw new Error("Password must be at least 8 characters");
		}

		this.props.passwordHash = await bcrypt.hash(newPassword, 10);
		this.props.updatedAt = new Date();
	}

	// For database reconstruction
	public static reconstitute(props: UserProps): User {
		return new User({
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
	public toDTO(): UserProps {
		return { ...this.props };
	}
}
