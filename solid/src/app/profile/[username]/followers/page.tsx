import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import UserList from "@/components/profile/UserList";

interface FollowersPageProps {
	params: { username: string };
}

export default async function FollowersPage({ params }: FollowersPageProps) {
	const { username } = params;
	const profile = await getProfileByUsername(username);

	if (!profile) {
		notFound();
	}

	// Get followers
	const followers = await prisma.follow.findMany({
		where: {
			followingId: profile.userId,
		},
		include: {
			follower: {
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

	// Format followers and check if the current user is following each follower
	const formattedFollowers = await Promise.all(
		followers.map(async (follow) => {
			const user = follow.follower;
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
				Followers of {profile.name || profile.username}
			</h1>
			<UserList users={formattedFollowers} emptyMessage="No followers yet" />
		</div>
	);
}
