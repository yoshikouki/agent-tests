import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import UserList from "@/components/profile/UserList";

interface FollowingPageProps {
	params: { username: string };
}

export default async function FollowingPage({ params }: FollowingPageProps) {
	const { username } = params;
	const profile = await getProfileByUsername(username);

	if (!profile) {
		notFound();
	}

	// Get users that this profile is following
	const following = await prisma.follow.findMany({
		where: {
			followerId: profile.userId,
		},
		include: {
			following: {
				include: {
					profile: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	const session = await getSession();

	// Format following users and check if the current user is following each of them
	const formattedFollowing = await Promise.all(
		following.map(async (follow) => {
			const user = follow.following;
			const userProfile = user.profile;

			// Check if current user is following this user
			let isFollowing = false;
			if (session?.user) {
				const followRecord = await prisma.follow.findFirst({
					where: {
						followerId: session.user.id,
						followingId: user.id,
					},
				});
				isFollowing = !!followRecord;
			}

			// Get follower counts for this user
			const [followersCount, followingCount] = await Promise.all([
				prisma.follow.count({
					where: {
						followingId: user.id,
					},
				}),
				prisma.follow.count({
					where: {
						followerId: user.id,
					},
				}),
			]);

			return {
				id: user.id,
				username: userProfile?.username || "",
				name: userProfile?.name || "",
				bio: userProfile?.bio || "",
				avatarUrl: userProfile?.avatarUrl || "",
				isFollowing,
				followersCount,
				followingCount,
				createdAt: user.createdAt.toISOString(),
			};
		}),
	);

	return (
		<div className="container py-6">
			<h1 className="text-2xl font-bold mb-6">
				{profile.name || profile.username} is following
			</h1>
			<UserList
				users={formattedFollowing}
				emptyMessage="Not following anyone yet"
			/>
		</div>
	);
}
