import type { Profile } from "../entities/Profile";

export interface ProfileRepository {
	save(profile: Profile): Promise<void>;
	findByUserId(userId: string): Promise<Profile | null>;
	delete(userId: string): Promise<void>;
}
