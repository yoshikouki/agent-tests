import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { ProfileWithUser } from "@/lib/profile";
import ProfileEditForm from "./ProfileEditForm";
import FollowButton from "./FollowButton";

interface ProfileViewProps {
	profile: ProfileWithUser;
	isCurrentUser: boolean;
	isFollowing?: boolean;
	followersCount?: number;
	followingCount?: number;
}

export default function ProfileView({
	profile,
	isCurrentUser,
	isFollowing = false,
	followersCount = 0,
	followingCount = 0,
}: ProfileViewProps) {
	const [isEditing, setIsEditing] = useState(false);

	if (isEditing && isCurrentUser) {
		return (
			<ProfileEditForm
				profile={profile}
				onCancel={() => setIsEditing(false)}
				onSuccess={() => setIsEditing(false)}
			/>
		);
	}

	return (
		<Card className="w-full max-w-3xl mx-auto">
			<CardHeader className="flex flex-col items-center gap-4">
				{profile.avatarUrl ? (
					<Image
						src={profile.avatarUrl}
						alt={profile.username}
						width={128}
						height={128}
						className="rounded-full"
					/>
				) : (
					<div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center text-2xl text-muted-foreground">
						{profile.username.charAt(0).toUpperCase()}
					</div>
				)}
				<div className="text-center">
					<h2 className="text-2xl font-bold">
						{profile.name || profile.username}
					</h2>
					<p className="text-muted-foreground">@{profile.username}</p>
				</div>
			</CardHeader>
			<CardContent>
				{profile.bio ? (
					<p className="text-center mb-4">{profile.bio}</p>
				) : (
					<p className="text-center text-muted-foreground mb-4">
						{isCurrentUser
							? "No bio yet. Click edit to add one!"
							: "No bio available."}
					</p>
				)}

				<div className="flex justify-center gap-8 mb-4">
					<Link
						href={`/profile/${profile.username}/followers`}
						className="text-center hover:underline"
					>
						<div className="font-bold">{followersCount}</div>
						<div className="text-sm text-muted-foreground">Followers</div>
					</Link>
					<Link
						href={`/profile/${profile.username}/following`}
						className="text-center hover:underline"
					>
						<div className="font-bold">{followingCount}</div>
						<div className="text-sm text-muted-foreground">Following</div>
					</Link>
				</div>

				{!isCurrentUser && (
					<FollowButton
						targetUserId={profile.userId}
						initialIsFollowing={isFollowing}
					/>
				)}
			</CardContent>
			{isCurrentUser && (
				<CardFooter className="flex justify-center">
					<Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
				</CardFooter>
			)}
		</Card>
	);
}
