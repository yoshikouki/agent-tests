import { prisma } from "./db";

export type ProfileWithUser = {
	id: string;
	userId: string;
	username: string;
	name: string | null;
	bio: string | null;
	avatarUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
	email: string;
};

export async function getUserProfile(userId: string) {
	const profile = await prisma.profile.findUnique({
		where: { userId },
		include: {
			user: {
				select: {
					email: true,
				},
			},
		},
	});

	if (!profile) {
		return null;
	}

	return {
		...profile,
		email: profile.user.email,
	} as ProfileWithUser;
}

export async function getProfileByUsername(username: string) {
	const profile = await prisma.profile.findUnique({
		where: { username },
		include: {
			user: {
				select: {
					email: true,
				},
			},
		},
	});

	if (!profile) {
		return null;
	}

	return {
		...profile,
		email: profile.user.email,
	} as ProfileWithUser;
}

export async function updateProfile(
	userId: string,
	data: {
		username?: string;
		name?: string;
		bio?: string;
		avatarUrl?: string;
	},
) {
	return prisma.profile.update({
		where: { userId },
		data,
	});
}
