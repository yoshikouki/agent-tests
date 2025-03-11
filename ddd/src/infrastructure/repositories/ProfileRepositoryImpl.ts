import { dbGet, dbRun } from "@/lib/db";
import type { ProfileRepository } from "@/domain/identity/repositories/ProfileRepository";
import { Profile, type ProfileProps } from "@/domain/identity/entities/Profile";

// Type for database row
interface ProfileRow {
	user_id: string;
	display_name: string | null;
	bio: string | null;
	avatar_url: string | null;
	created_at: string;
	updated_at: string;
}

export class ProfileRepositoryImpl implements ProfileRepository {
	async save(profile: Profile): Promise<void> {
		const dto = profile.toDTO();
		const existingProfile = await this.findByUserId(dto.userId);

		if (existingProfile) {
			// Update existing profile
			await dbRun(
				`UPDATE profiles SET 
          display_name = $displayName, 
          bio = $bio, 
          avatar_url = $avatarUrl, 
          updated_at = $updatedAt 
        WHERE user_id = $userId`,
				{
					$userId: dto.userId,
					$displayName: dto.displayName,
					$bio: dto.bio,
					$avatarUrl: dto.avatarUrl,
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		} else {
			// Insert new profile
			await dbRun(
				`INSERT INTO profiles (
          user_id, 
          display_name, 
          bio, 
          avatar_url, 
          created_at, 
          updated_at
        ) VALUES (
          $userId, 
          $displayName, 
          $bio, 
          $avatarUrl, 
          $createdAt, 
          $updatedAt
        )`,
				{
					$userId: dto.userId,
					$displayName: dto.displayName,
					$bio: dto.bio,
					$avatarUrl: dto.avatarUrl,
					$createdAt: dto.createdAt.toISOString(),
					$updatedAt: dto.updatedAt.toISOString(),
				},
			);
		}
	}

	async findByUserId(userId: string): Promise<Profile | null> {
		const row = await dbGet<ProfileRow>(
			"SELECT * FROM profiles WHERE user_id = $userId",
			{ $userId: userId },
		);

		if (!row) return null;

		return Profile.reconstitute(this.mapRowToProps(row));
	}

	async delete(userId: string): Promise<void> {
		await dbRun("DELETE FROM profiles WHERE user_id = $userId", {
			$userId: userId,
		});
	}

	// Helper method to map database row to ProfileProps
	private mapRowToProps(row: ProfileRow): ProfileProps {
		return {
			userId: row.user_id,
			displayName: row.display_name,
			bio: row.bio,
			avatarUrl: row.avatar_url,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
		};
	}
}
