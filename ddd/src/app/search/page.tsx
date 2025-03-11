"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface User {
	id: string;
	name: string;
	email: string;
	profilePicture?: string;
	isFollowing: boolean;
	isCurrentUser: boolean;
}

export default function SearchPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialQuery = searchParams.get("q") || "";

	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFollowLoading, setIsFollowLoading] = useState<
		Record<string, boolean>
	>({});

	useEffect(() => {
		if (initialQuery) {
			searchUsers(initialQuery);
		}
	}, [initialQuery]);

	const searchUsers = async (query: string) => {
		if (!query.trim()) {
			setUsers([]);
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/search/users?q=${encodeURIComponent(query)}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to search users");
			}

			const data = await response.json();
			setUsers(data.users);
		} catch (error) {
			console.error("Error searching users:", error);
			toast.error("Failed to search users");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();

		// Update URL with search query
		const params = new URLSearchParams(searchParams);
		if (searchQuery) {
			params.set("q", searchQuery);
		} else {
			params.delete("q");
		}

		router.push(`/search?${params.toString()}`);
		searchUsers(searchQuery);
	};

	const handleFollow = async (userId: string) => {
		const user = users.find((u) => u.id === userId);
		if (!user) return;

		setIsFollowLoading((prev) => ({ ...prev, [userId]: true }));

		try {
			const method = user.isFollowing ? "DELETE" : "POST";

			// Optimistic update
			setUsers(
				users.map((u) =>
					u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u,
				),
			);

			const response = await fetch(`/api/follows/${userId}`, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				// Revert optimistic update on failure
				setUsers(
					users.map((u) =>
						u.id === userId ? { ...u, isFollowing: u.isFollowing } : u,
					),
				);
				throw new Error(
					`Failed to ${user.isFollowing ? "unfollow" : "follow"} user`,
				);
			}

			const message = user.isFollowing
				? "Unfollowed successfully"
				: "Following successfully";
			toast.success(message);
		} catch (error) {
			console.error("Error following user:", error);
			toast.error("Failed to update follow status");
		} finally {
			setIsFollowLoading((prev) => ({ ...prev, [userId]: false }));
		}
	};

	const navigateToProfile = (userId: string) => {
		router.push(`/profile/${userId}`);
	};

	const handleKeyDown = (userId: string, e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			navigateToProfile(userId);
		}
	};

	return (
		<div className="container max-w-4xl py-6">
			<h1 className="mb-6 text-3xl font-bold">Search Users</h1>

			<form onSubmit={handleSearch} className="mb-8">
				<div className="flex gap-2">
					<Input
						type="text"
						placeholder="Search by name or email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1"
					/>
					<Button type="submit" disabled={isLoading}>
						Search
					</Button>
				</div>
			</form>

			{isLoading ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="flex items-center justify-between p-4">
								<div className="flex items-center gap-4">
									<Skeleton className="h-12 w-12 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
								<Skeleton className="h-9 w-24" />
							</CardContent>
						</Card>
					))}
				</div>
			) : users.length > 0 ? (
				<div className="space-y-4">
					{users.map((user) => (
						<Card key={user.id}>
							<CardContent className="flex items-center justify-between p-4">
								<button
									type="button"
									className="flex items-center gap-4 cursor-pointer text-left bg-transparent border-0 p-0"
									onClick={() => navigateToProfile(user.id)}
									aria-label={`View ${user.name}'s profile`}
								>
									<Avatar className="h-12 w-12">
										<AvatarImage src={user.profilePicture} alt={user.name} />
										<AvatarFallback>
											{user.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="font-semibold">{user.name}</h3>
										<p className="text-sm text-muted-foreground">
											{user.email}
										</p>
									</div>
								</button>
								{!user.isCurrentUser && (
									<Button
										variant={user.isFollowing ? "outline" : "default"}
										size="sm"
										className="flex items-center gap-1"
										onClick={() => handleFollow(user.id)}
										disabled={isFollowLoading[user.id]}
									>
										{user.isFollowing ? (
											<>
												<UserCheck className="h-4 w-4" />
												Following
											</>
										) : (
											<>
												<UserPlus className="h-4 w-4" />
												Follow
											</>
										)}
									</Button>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			) : searchQuery && !isLoading ? (
				<div className="py-8 text-center">
					<p className="text-muted-foreground">
						No users found matching "{searchQuery}"
					</p>
				</div>
			) : null}
		</div>
	);
}
