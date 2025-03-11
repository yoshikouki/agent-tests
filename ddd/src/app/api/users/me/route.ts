import { NextResponse } from "next/server";
import { ProfileService } from "@/application/services/ProfileService";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";
import { ProfileRepositoryImpl } from "@/infrastructure/repositories/ProfileRepositoryImpl";

// Get current user profile
export async function GET(request: Request) {
	try {
		// Get user ID from request headers (set by middleware)
		const userId = request.headers.get("x-user-id");

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Create repositories and services
		const userRepository = new UserRepositoryImpl();
		const profileRepository = new ProfileRepositoryImpl();
		const profileService = new ProfileService({ profileRepository });

		// Get user profile
		const profile = await profileService.getProfileByUserId(userId);

		if (!profile) {
			return NextResponse.json({ error: "Profile not found" }, { status: 404 });
		}

		// Get user information
		const user = await userRepository.findById(userId);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Return user profile
		return NextResponse.json({
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
			profile: {
				id: profile.id,
				displayName: profile.displayName,
				bio: profile.bio,
				avatarUrl: profile.avatarUrl,
				createdAt: profile.createdAt,
				updatedAt: profile.updatedAt,
			},
		});
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user profile" },
			{ status: 500 },
		);
	}
}

// Update current user profile
export async function PATCH(request: Request) {
	try {
		// Get user ID from request headers (set by middleware)
		const userId = request.headers.get("x-user-id");

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		const { displayName, bio, avatarUrl } = body;

		// Create repositories and services
		const profileRepository = new ProfileRepositoryImpl();
		const profileService = new ProfileService({ profileRepository });

		// Get user profile
		const existingProfile = await profileService.getProfileByUserId(userId);

		if (!existingProfile) {
			// Create profile if it doesn't exist
			const newProfile = await profileService.createProfile(userId, {
				displayName,
				bio,
				avatarUrl,
			});

			return NextResponse.json(
				{
					message: "Profile created successfully",
					profile: {
						id: newProfile.id,
						displayName: newProfile.displayName,
						bio: newProfile.bio,
						avatarUrl: newProfile.avatarUrl,
						createdAt: newProfile.createdAt,
						updatedAt: newProfile.updatedAt,
					},
				},
				{ status: 201 },
			);
		}

		// Update profile
		const updatedProfile = await profileService.updateProfile(
			existingProfile.id,
			{
				displayName,
				bio,
				avatarUrl,
			},
		);

		// Return updated profile
		return NextResponse.json({
			message: "Profile updated successfully",
			profile: {
				id: updatedProfile.id,
				displayName: updatedProfile.displayName,
				bio: updatedProfile.bio,
				avatarUrl: updatedProfile.avatarUrl,
				createdAt: updatedProfile.createdAt,
				updatedAt: updatedProfile.updatedAt,
			},
		});
	} catch (error) {
		console.error("Error updating user profile:", error);
		return NextResponse.json(
			{ error: "Failed to update user profile" },
			{ status: 500 },
		);
	}
}
