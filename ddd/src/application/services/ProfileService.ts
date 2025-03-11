import { Profile } from "@/domain/identity/entities/Profile";
import { IProfileRepository } from "@/domain/identity/repositories/IProfileRepository";

interface ProfileServiceOptions {
	profileRepository: IProfileRepository;
}

export class ProfileService {
	private profileRepository: IProfileRepository;

	constructor({ profileRepository }: ProfileServiceOptions) {
		this.profileRepository = profileRepository;
	}

	async getProfileById(id: string): Promise<Profile | null> {
		return this.profileRepository.findById(id);
	}

	async getProfileByUserId(userId: string): Promise<Profile | null> {
		return this.profileRepository.findByUserId(userId);
	}

	async updateProfile(
		id: string,
		data: Partial<Omit<Profile, "id" | "userId" | "createdAt">>,
	): Promise<Profile> {
		const profile = await this.profileRepository.findById(id);

		if (!profile) {
			throw new Error("Profile not found");
		}

		// Update the profile with the new data
		const updatedProfile = {
			...profile,
			...data,
			updatedAt: new Date(),
		};

		return this.profileRepository.update(updatedProfile);
	}

	async createProfile(
		userId: string,
		data: Partial<Omit<Profile, "id" | "userId" | "createdAt" | "updatedAt">>,
	): Promise<Profile> {
		const existingProfile = await this.profileRepository.findByUserId(userId);

		if (existingProfile) {
			throw new Error("Profile already exists for this user");
		}

		const newProfile: Omit<Profile, "id"> = {
			userId,
			displayName: data.displayName || "",
			bio: data.bio || "",
			avatarUrl: data.avatarUrl || "",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		return this.profileRepository.create(newProfile);
	}
}
