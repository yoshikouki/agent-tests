import { dbAll, dbGet, dbRun } from "@/lib/db";
import type { UserRepository } from "@/domain/identity/repositories/UserRepository";
import { User, type UserProps } from "@/domain/identity/entities/User";

// Type for database row
interface UserRow {
	id: string;
	username: string;
	email: string;
	password_hash: string;
	created_at: string;
	updated_at: string;
}

export class UserRepositoryImpl implements UserRepository {
	async save(user: User): Promise<void> {
		const dto = user.toDTO();
		const existingUser = await this.findById(dto.id);

		if (existingUser) {
			// Update existing user
			await dbRun(
				`UPDATE users SET 
          username = $username, 
          email = $email, 
          password_hash = $passwordHash, 
          updated_at = $updatedAt 
        WHERE id = $id`,
				{
					$id: dto.id,
					$username: dto.username,
					$email: dto.email,
					$passwordHash: dto.passwordHash,
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		} else {
			// Insert new user
			await dbRun(
				`INSERT INTO users (
          id, 
          username, 
          email, 
          password_hash, 
          created_at, 
          updated_at
        ) VALUES (
          $id, 
          $username, 
          $email, 
          $passwordHash, 
          $createdAt, 
          $updatedAt
        )`,
				{
					$id: dto.id,
					$username: dto.username,
					$email: dto.email,
					$passwordHash: dto.passwordHash,
					$createdAt: dto.createdAt.toISOString(),
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		}
	}

	async findById(id: string): Promise<User | null> {
		const row = await dbGet<UserRow>("SELECT * FROM users WHERE id = $id", {
			$id: id,
		});

		if (!row) return null;

		return User.reconstitute(this.mapRowToProps(row));
	}

	async findByUsername(username: string): Promise<User | null> {
		const row = await dbGet<UserRow>(
			"SELECT * FROM users WHERE username = $username",
			{ $username: username },
		);

		if (!row) return null;

		return User.reconstitute(this.mapRowToProps(row));
	}

	async findByEmail(email: string): Promise<User | null> {
		const row = await dbGet<UserRow>(
			"SELECT * FROM users WHERE email = $email",
			{ $email: email },
		);

		if (!row) return null;

		return User.reconstitute(this.mapRowToProps(row));
	}

	async search(
		query: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ users: User[]; total: number }> {
		const offset = (page - 1) * limit;
		const searchPattern = `%${query}%`;

		const rows = await dbAll<UserRow>(
			`SELECT * FROM users 
       WHERE username LIKE $pattern OR email LIKE $pattern
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
			{
				$pattern: searchPattern,
				$limit: limit,
				$offset: offset,
			},
		);

		const countResult = await dbGet<{ count: number }>(
			`SELECT COUNT(*) as count FROM users 
       WHERE username LIKE $pattern OR email LIKE $pattern`,
			{ $pattern: searchPattern },
		);

		const total = countResult?.count || 0;
		const users = rows.map((row) => User.reconstitute(this.mapRowToProps(row)));

		return { users, total };
	}

	async delete(id: string): Promise<void> {
		await dbRun("DELETE FROM users WHERE id = $id", { $id: id });
	}

	// Helper method to map database row to UserProps
	private mapRowToProps(row: UserRow): UserProps {
		return {
			id: row.id,
			username: row.username,
			email: row.email,
			passwordHash: row.password_hash,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
		};
	}
}
