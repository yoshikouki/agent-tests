"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
	id: string;
	username: string;
	name: string;
	bio: string;
	avatarUrl: string;
	followersCount: number;
	followingCount: number;
	isFollowing: boolean;
	createdAt: string;
}

interface UserListProps {
	users: User[];
	emptyMessage?: string;
}

export default function UserList({
	users,
	emptyMessage = "No users found",
}: UserListProps) {
	const router = useRouter();
	const [userList, setUserList] = useState<User[]>(users);

	const toggleFollow = async (userId: string) => {
		try {
			// Find the user in the list
			const user = userList.find((u) => u.id === userId);
			if (!user) return;

			const method = user.isFollowing ? "DELETE" : "POST";
			const response = await fetch("/api/follow", {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ targetUserId: userId }),
			});

			if (!response.ok) {
				throw new Error("Failed to follow/unfollow user");
			}

			// Update the user state
			setUserList(
				userList.map((u) =>
					u.id === userId
						? {
								...u,
								isFollowing: !u.isFollowing,
								followersCount: u.isFollowing
									? u.followersCount - 1
									: u.followersCount + 1,
							}
						: u,
				),
			);

			// Refresh the router to update any UI that depends on this data
			router.refresh();
		} catch (error) {
			console.error("Error toggling follow:", error);
		}
	};

	if (users.length === 0) {
		return <div className="text-center py-8">{emptyMessage}</div>;
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{userList.map((user) => (
				<Card key={user.id} className="overflow-hidden">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-4">
							<Avatar className="h-12 w-12">
								{user.avatarUrl ? (
									<AvatarImage src={user.avatarUrl} alt={user.username} />
								) : (
									<AvatarFallback>
										{user.username.substring(0, 2).toUpperCase()}
									</AvatarFallback>
								)}
							</Avatar>

							<div className="flex-1">
								<Link
									href={`/profile/${user.username}`}
									className="font-semibold hover:underline"
								>
									{user.name || user.username}
								</Link>
								<p className="text-sm text-muted-foreground">
									@{user.username}
								</p>
							</div>

							<Button
								onClick={() => toggleFollow(user.id)}
								variant={user.isFollowing ? "outline" : "default"}
								size="sm"
							>
								{user.isFollowing ? "Unfollow" : "Follow"}
							</Button>
						</div>
					</CardHeader>

					<CardContent>
						{user.bio && <p className="text-sm mb-3">{user.bio}</p>}

						<div className="flex gap-4 text-sm">
							<Link
								href={`/profile/${user.username}/followers`}
								className="text-muted-foreground hover:underline"
							>
								{user.followersCount} Followers
							</Link>
							<Link
								href={`/profile/${user.username}/following`}
								className="text-muted-foreground hover:underline"
							>
								{user.followingCount} Following
							</Link>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
