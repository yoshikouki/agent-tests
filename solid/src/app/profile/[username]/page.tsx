import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProfileByUsername } from "@/lib/profile";
import { prisma } from "@/lib/db";
import ProfileView from "@/components/profile/ProfileView";

interface ProfilePageProps {
	params: { username: string };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
	const { username } = params;
	const profile = await getProfileByUsername(username);

	if (!profile) {
		notFound();
	}

	const session = await getSession();
	const isCurrentUser = session?.user.id === profile.userId;

	// Check if the current user is following this profile
	let isFollowing = false;

	if (session?.user && !isCurrentUser) {
		const follow = await prisma.follow.findFirst({
			where: {
				followerId: session.user.id,
				followingId: profile.userId,
			},
		});

		isFollowing = !!follow;
	}

	// Get follower and following counts
	const [followersCount, followingCount] = await Promise.all([
		prisma.follow.count({
			where: {
				followingId: profile.userId,
			},
		}),
		prisma.follow.count({
			where: {
				followerId: profile.userId,
			},
		}),
	]);

	return (
		<div className="container py-6">
			<h1 className="text-2xl font-bold mb-6">
				{isCurrentUser
					? "Your Profile"
					: `${profile.name || profile.username}'s Profile`}
			</h1>
			<ProfileView
				profile={profile}
				isCurrentUser={isCurrentUser}
				isFollowing={isFollowing}
				followersCount={followersCount}
				followingCount={followingCount}
			/>
		</div>
	);
}
