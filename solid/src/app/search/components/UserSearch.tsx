"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface User {
	id: string;
	username: string;
	name: string;
	bio: string;
	avatarUrl: string;
	followersCount: number;
	followingCount: number;
	postsCount: number;
	isFollowing: boolean;
	createdAt: string;
}

interface UserSearchProps {
	query: string;
}

export function UserSearch({ query }: UserSearchProps) {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!query) {
			setUsers([]);
			return;
		}

		const fetchUsers = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					`/api/search?q=${encodeURIComponent(query)}`,
				);

				if (!response.ok) {
					throw new Error("Failed to fetch search results");
				}

				const data = await response.json();
				setUsers(data.users);
			} catch (err) {
				console.error("Error searching users:", err);
				setError("Failed to load search results");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [query]);

	const toggleFollow = async (userId: string) => {
		try {
			const response = await fetch("/api/follow", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId }),
			});

			if (!response.ok) {
				throw new Error("Failed to follow/unfollow user");
			}

			// Update UI
			setUsers(
				users.map((user) =>
					user.id === userId
						? {
								...user,
								isFollowing: !user.isFollowing,
								followersCount: user.isFollowing
									? user.followersCount - 1
									: user.followersCount + 1,
							}
						: user,
				),
			);
		} catch (err) {
			console.error("Error toggling follow:", err);
		}
	};

	if (loading) {
		return <div className="text-center py-8">Searching...</div>;
	}

	if (error) {
		return <div className="text-red-500 text-center py-8">{error}</div>;
	}

	if (users.length === 0 && query) {
		return (
			<div className="text-center py-8">No users found matching "{query}"</div>
		);
	}

	if (!query) {
		return (
			<div className="text-center py-8">Enter a search term to find users</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{users.map((user) => (
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
							<span className="text-muted-foreground">
								{user.postsCount} Posts
							</span>
							<span className="text-muted-foreground">
								{user.followersCount} Followers
							</span>
							<span className="text-muted-foreground">
								{user.followingCount} Following
							</span>
						</div>

						<div className="text-xs text-muted-foreground mt-2">
							Joined{" "}
							{formatDistanceToNow(new Date(user.createdAt), {
								addSuffix: true,
							})}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
