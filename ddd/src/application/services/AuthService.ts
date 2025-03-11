import { User } from "@/domain/identity/entities/User";
import { IUserRepository } from "@/domain/identity/repositories/IUserRepository";
import { sign, verify } from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET =
	process.env.JWT_SECRET || "default_jwt_secret_replace_in_production";
const SALT_ROUNDS = 10;

interface AuthServiceOptions {
	userRepository: IUserRepository;
}

export class AuthService {
	private userRepository: IUserRepository;

	constructor({ userRepository }: AuthServiceOptions) {
		this.userRepository = userRepository;
	}

	async signup(
		username: string,
		email: string,
		password: string,
	): Promise<{ user: User; token: string }> {
		// Check if user already exists
		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			throw new Error("User with this email already exists");
		}

		const existingUsername = await this.userRepository.findByUsername(username);
		if (existingUsername) {
			throw new Error("Username already taken");
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

		// Create new user
		const newUser = await this.userRepository.create({
			username,
			email,
			passwordHash,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Generate JWT
		const token = this.generateToken(newUser);

		return { user: newUser, token };
	}

	async login(
		emailOrUsername: string,
		password: string,
	): Promise<{ user: User; token: string }> {
		// Find user by email or username
		const user =
			(await this.userRepository.findByEmail(emailOrUsername)) ||
			(await this.userRepository.findByUsername(emailOrUsername));

		if (!user) {
			throw new Error("Invalid credentials");
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.passwordHash);
		if (!isValidPassword) {
			throw new Error("Invalid credentials");
		}

		// Generate JWT
		const token = this.generateToken(user);

		return { user, token };
	}

	verifyToken(token: string): { userId: string } {
		try {
			const decoded = verify(token, JWT_SECRET) as { userId: string };
			return decoded;
		} catch (error) {
			throw new Error("Invalid token");
		}
	}

	private generateToken(user: User): string {
		return sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
	}
}
