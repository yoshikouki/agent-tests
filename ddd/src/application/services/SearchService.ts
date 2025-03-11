import { User } from "@/domain/identity/entities/User";
import { IUserRepository } from "@/domain/identity/repositories/IUserRepository";
import { IProfileRepository } from "@/domain/identity/repositories/IProfileRepository";

interface SearchServiceOptions {
	userRepository: IUserRepository;
	profileRepository: IProfileRepository;
}

export class SearchService {
	private userRepository: IUserRepository;
	private profileRepository: IProfileRepository;

	constructor({ userRepository, profileRepository }: SearchServiceOptions) {
		this.userRepository = userRepository;
		this.profileRepository = profileRepository;
	}

	async searchUsers(
		query: string,
		page: number = 1,
		limit: number = 10,
	): Promise<{ users: User[]; total: number }> {
		if (!query || query.trim().length === 0) {
			throw new Error("Search query cannot be empty");
		}

		// Search by username
		const usernameResults = await this.userRepository.searchByUsername(query, {
			page,
			limit,
		});

		// If we have enough results from username search, return those
		if (usernameResults.users.length >= limit) {
			return usernameResults;
		}

		// Otherwise, search by display name in profiles
		const remainingLimit = limit - usernameResults.users.length;
		const displayNameResults = await this.profileRepository.searchByDisplayName(
			query,
			{ page, limit: remainingLimit },
		);

		// Combine results, removing duplicates
		const combinedUsers = [...usernameResults.users];
		const existingUserIds = new Set(combinedUsers.map((user) => user.id));

		for (const profileUserId of displayNameResults.userIds) {
			if (!existingUserIds.has(profileUserId)) {
				const user = await this.userRepository.findById(profileUserId);
				if (user) {
					combinedUsers.push(user);
					existingUserIds.add(profileUserId);
				}
			}
		}

		return {
			users: combinedUsers,
			total: usernameResults.total + displayNameResults.total,
		};
	}
}
