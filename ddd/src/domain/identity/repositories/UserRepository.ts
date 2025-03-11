import type { User } from "../entities/User";

export interface UserRepository {
	save(user: User): Promise<void>;
	findById(id: string): Promise<User | null>;
	findByUsername(username: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	search(
		query: string,
		page: number,
		limit: number,
	): Promise<{ users: User[]; total: number }>;
	delete(id: string): Promise<void>;
}
