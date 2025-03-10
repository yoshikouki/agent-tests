"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Post } from "@/lib/models/post";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostCard } from "@/components/posts/post-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, UserIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
	id: string;
	name: string;
	email: string;
	bio: string | null;
	imageUrl: string | null;
	createdAt: string;
	followersCount: number;
	followingCount: number;
	isFollowing: boolean;
	isCurrentUser: boolean;
}

export default function ProfilePage() {
	const params = useParams();
	const userId = params.id as string;
	const { data: session } = useSession();

	const [user, setUser] = useState<UserProfile | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoadingUser, setIsLoadingUser] = useState(true);
	const [isLoadingPosts, setIsLoadingPosts] = useState(true);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isProcessingFollow, setIsProcessingFollow] = useState(false);

	useEffect(() => {
		if (userId) {
			fetchUser();
			fetchUserPosts();
		}
	}, [userId]);

	const fetchUser = async () => {
		try {
			setIsLoadingUser(true);
			const response = await fetch(`/api/users/${userId}`);

			if (!response.ok) {
				throw new Error("Failed to fetch user");
			}

			const data = await response.json();
			setUser(data.user);
			setIsFollowing(data.user.isFollowing);
		} catch (error) {
			console.error("Error fetching user:", error);
			toast.error("Failed to load user profile");
		} finally {
			setIsLoadingUser(false);
		}
	};

	const fetchUserPosts = async () => {
		try {
			setIsLoadingPosts(true);
			const response = await fetch(`/api/users/${userId}/posts`);

			if (!response.ok) {
				throw new Error("Failed to fetch user posts");
			}

			const data = await response.json();
			setPosts(data.posts);
		} catch (error) {
			console.error("Error fetching user posts:", error);
			toast.error("Failed to load user posts");
		} finally {
			setIsLoadingPosts(false);
		}
	};

	const handleFollowToggle = async () => {
		if (!session?.user) {
			toast.error("You must be logged in to follow users");
			return;
		}

		setIsProcessingFollow(true);

		try {
			const response = await fetch(`/api/users/${userId}/follow`, {
				method: isFollowing ? "DELETE" : "POST",
			});

			if (!response.ok) {
				throw new Error(
					`Failed to ${isFollowing ? "unfollow" : "follow"} user`,
				);
			}

			setIsFollowing(!isFollowing);
			toast.success(isFollowing ? "Unfollowed user" : "Following user");

			// Update the follower count
			if (user) {
				setUser({
					...user,
					followersCount: isFollowing
						? user.followersCount - 1
						: user.followersCount + 1,
				});
			}
		} catch (error) {
			console.error("Error toggling follow:", error);
			toast.error(`Failed to ${isFollowing ? "unfollow" : "follow"} user`);
		} finally {
			setIsProcessingFollow(false);
		}
	};

	const handleDeletePost = async (postId: string) => {
		try {
			const response = await fetch(`/api/posts/${postId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete post");
			}

			setPosts((prev) => prev.filter((post) => post.id !== postId));
			toast.success("Post deleted successfully");
		} catch (error) {
			console.error("Error deleting post:", error);
			toast.error("Failed to delete post");
			throw error;
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	if (isLoadingUser) {
		return (
			<div className="container py-8">
				<div className="flex flex-col md:flex-row gap-6 md:gap-10">
					<Skeleton className="h-24 w-24 rounded-full" />
					<div className="flex-1 space-y-4">
						<Skeleton className="h-8 w-40" />
						<Skeleton className="h-4 w-full max-w-md" />
						<div className="flex gap-4">
							<Skeleton className="h-10 w-24" />
							<Skeleton className="h-10 w-24" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container py-8">
				<div className="text-center py-12">
					<h2 className="text-xl font-medium mb-2">User not found</h2>
					<p className="text-muted-foreground">
						The user you are looking for does not exist.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container py-8">
			<div className="mb-8">
				<div className="flex flex-col md:flex-row gap-6 md:gap-10">
					<Avatar className="h-24 w-24">
						<AvatarImage src={user.imageUrl || ""} alt={user.name} />
						<AvatarFallback className="text-lg">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
							<div>
								<h1 className="text-2xl font-bold">{user.name}</h1>
								<p className="text-muted-foreground">{user.email}</p>
							</div>

							{!user.isCurrentUser && (
								<Button
									onClick={handleFollowToggle}
									disabled={isProcessingFollow}
									variant={isFollowing ? "outline" : "default"}
								>
									{isProcessingFollow
										? "Processing..."
										: isFollowing
											? "Unfollow"
											: "Follow"}
								</Button>
							)}

							{user.isCurrentUser && (
								<Button variant="outline" asChild>
									<a href="/app/profile/edit">Edit Profile</a>
								</Button>
							)}
						</div>

						{user.bio && <p className="mb-4">{user.bio}</p>}

						<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<UsersIcon className="h-4 w-4" />
								<span>
									<strong className="text-foreground">
										{user.followersCount}
									</strong>{" "}
									followers
								</span>
							</div>
							<div className="flex items-center gap-1">
								<UsersIcon className="h-4 w-4" />
								<span>
									<strong className="text-foreground">
										{user.followingCount}
									</strong>{" "}
									following
								</span>
							</div>
							<div className="flex items-center gap-1">
								<CalendarIcon className="h-4 w-4" />
								<span>
									Joined {format(new Date(user.createdAt), "MMMM yyyy")}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Tabs defaultValue="posts" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="posts">Posts</TabsTrigger>
					<TabsTrigger value="likes">Likes</TabsTrigger>
				</TabsList>

				<TabsContent value="posts" className="space-y-4">
					{isLoadingPosts ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-64 w-full" />
							))}
						</div>
					) : posts.length === 0 ? (
						<div className="text-center py-12">
							<div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
								<UserIcon className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-medium mb-2">No posts yet</h3>
							<p className="text-muted-foreground">
								{user.isCurrentUser
									? "You haven't created any posts yet."
									: "This user hasn't created any posts yet."}
							</p>
						</div>
					) : (
						posts.map((post) => (
							<PostCard
								key={post.id}
								post={post}
								onDelete={user.isCurrentUser ? handleDeletePost : undefined}
							/>
						))
					)}
				</TabsContent>

				<TabsContent value="likes">
					<div className="text-center py-12">
						<div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
							<UserIcon className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-medium mb-2">Coming soon</h3>
						<p className="text-muted-foreground">
							Liked posts will be displayed here soon.
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
