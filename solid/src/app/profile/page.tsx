import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile } from "@/lib/profile";
import { prisma } from "@/lib/db";
import ProfileView from "@/components/profile/ProfileView";

export default async function ProfilePage() {
	const session = await getSession();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const profile = await getUserProfile(session.user.id);

	if (!profile) {
		redirect("/");
	}

	// Get follower and following counts
	const [followersCount, followingCount] = await Promise.all([
		prisma.follow.count({
			where: {
				followingId: session.user.id,
			},
		}),
		prisma.follow.count({
			where: {
				followerId: session.user.id,
			},
		}),
	]);

	return (
		<div className="container py-6">
			<h1 className="text-2xl font-bold mb-6">Your Profile</h1>
			<ProfileView
				profile={profile}
				isCurrentUser={true}
				followersCount={followersCount}
				followingCount={followingCount}
			/>
		</div>
	);
}
