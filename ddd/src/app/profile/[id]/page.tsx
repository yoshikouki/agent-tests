"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Heart,
	MessageCircle,
	Share2,
	ArrowLeft,
	UserPlus,
	UserCheck,
	Edit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
	id: string;
	name: string;
	email: string;
	bio?: string;
	profilePicture?: string;
	followerCount: number;
	followingCount: number;
	postCount: number;
	isFollowing: boolean;
	isCurrentUser: boolean;
}

interface Post {
	id: string;
	content: string;
	createdAt: string;
	user: {
		id: string;
		name: string;
		profilePicture?: string;
	};
	likeCount: number;
	commentCount: number;
	isLiked: boolean;
}

export default function ProfilePage() {
	const params = useParams();
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isPostsLoading, setIsPostsLoading] = useState(true);
	const [isFollowLoading, setIsFollowLoading] = useState(false);
	const userId = params.id as string;

	useEffect(() => {
		fetchUser();
		fetchUserPosts();
	}, []);

	const fetchUser = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/users/${params.id}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				if (response.status === 404) {
					toast.error("User not found");
					router.push("/feed");
					return;
				}
				throw new Error("Failed to fetch user profile");
			}

			const data = await response.json();
			setUser(data.user);
		} catch (error) {
			console.error("Error fetching user profile:", error);
			toast.error("Failed to load user profile");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchUserPosts = async () => {
		setIsPostsLoading(true);
		try {
			const response = await fetch(`/api/users/${params.id}/posts`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user posts");
			}

			const data = await response.json();
			setPosts(data.posts);
		} catch (error) {
			console.error("Error fetching user posts:", error);
			toast.error("Failed to load user posts");
		} finally {
			setIsPostsLoading(false);
		}
	};

	const handleFollow = async () => {
		if (!user) return;

		setIsFollowLoading(true);
		try {
			const method = user.isFollowing ? "DELETE" : "POST";

			// Optimistic update
			setUser({
				...user,
				isFollowing: !user.isFollowing,
				followerCount: user.isFollowing
					? user.followerCount - 1
					: user.followerCount + 1,
			});

			const response = await fetch(`/api/follows/${user.id}`, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				// Revert optimistic update on failure
				setUser({
					...user,
					isFollowing: !user.isFollowing,
					followerCount: !user.isFollowing
						? user.followerCount - 1
						: user.followerCount + 1,
				});
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
			setIsFollowLoading(false);
		}
	};

	const handlePostClick = (postId: string) => {
		router.push(`/posts/${postId}`);
	};

	const handleLike = async (postId: string, e: React.MouseEvent) => {
		e.stopPropagation();

		const post = posts.find((p) => p.id === postId);
		if (!post) return;

		const isCurrentlyLiked = post.isLiked;

		// Optimistic update
		setPosts(
			posts.map((p) =>
				p.id === postId
					? {
							...p,
							isLiked: !isCurrentlyLiked,
							likeCount: isCurrentlyLiked ? p.likeCount - 1 : p.likeCount + 1,
						}
					: p,
			),
		);

		try {
			const response = await fetch(`/api/posts/${postId}/like`, {
				method: isCurrentlyLiked ? "DELETE" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				// Revert optimistic update if request fails
				setPosts(
					posts.map((p) =>
						p.id === postId
							? {
									...p,
									isLiked: isCurrentlyLiked,
									likeCount: isCurrentlyLiked ? p.likeCount : p.likeCount - 1,
								}
							: p,
					),
				);

				throw new Error("Failed to update like");
			}
		} catch (error) {
			console.error("Error liking post:", error);
			toast.error("Failed to update like");
		}
	};

	const handleEditProfile = () => {
		router.push("/profile/edit");
	};

	return (
		<div className="container max-w-4xl py-6">
			<Button
				className="mb-4 flex items-center gap-2"
				variant="ghost"
				onClick={() => router.back()}
			>
				<ArrowLeft className="h-4 w-4" />
				Back
			</Button>

			{isLoading ? (
				<div className="space-y-8">
					<div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
						<Skeleton className="h-32 w-32 rounded-full" />
						<div className="space-y-2 text-center sm:text-left">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-4 w-72" />
							<Skeleton className="h-16 w-full max-w-lg" />
						</div>
					</div>
				</div>
			) : user ? (
				<div className="space-y-8">
					<div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
						<Avatar className="h-32 w-32">
							<AvatarImage src={user.profilePicture} alt={user.name} />
							<AvatarFallback className="text-4xl">
								{user.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-2 text-center sm:text-left">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
								<h1 className="text-3xl font-bold">{user.name}</h1>
								{user.isCurrentUser ? (
									<Button
										variant="outline"
										className="flex items-center gap-2"
										onClick={handleEditProfile}
									>
										<Edit className="h-4 w-4" />
										Edit Profile
									</Button>
								) : (
									<Button
										className="flex items-center gap-2"
										variant={user.isFollowing ? "outline" : "default"}
										onClick={handleFollow}
										disabled={isFollowLoading}
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
							</div>
							<div className="flex justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
								<span>
									<strong>{user.postCount}</strong> Posts
								</span>
								<span>
									<strong>{user.followerCount}</strong> Followers
								</span>
								<span>
									<strong>{user.followingCount}</strong> Following
								</span>
							</div>
							{user.bio && (
								<p className="max-w-lg whitespace-pre-wrap">{user.bio}</p>
							)}
						</div>
					</div>

					<Tabs defaultValue="posts" className="w-full">
						<TabsList className="w-full">
							<TabsTrigger value="posts" className="flex-1">
								Posts
							</TabsTrigger>
							<TabsTrigger value="liked" className="flex-1">
								Likes
							</TabsTrigger>
						</TabsList>
						<TabsContent value="posts" className="mt-6">
							{isPostsLoading ? (
								<div className="space-y-4">
									{[1, 2, 3].map((i) => (
										<Card key={i}>
											<CardHeader className="pb-2">
												<Skeleton className="h-4 w-32" />
											</CardHeader>
											<CardContent className="pb-2">
												<Skeleton className="h-24 w-full" />
											</CardContent>
											<CardFooter>
												<Skeleton className="h-8 w-full" />
											</CardFooter>
										</Card>
									))}
								</div>
							) : posts.length > 0 ? (
								<div className="space-y-4">
									{posts.map((post) => (
										<Card
											key={post.id}
											className="cursor-pointer hover:shadow-md"
											onClick={() => handlePostClick(post.id)}
										>
											<CardHeader className="pb-2">
												<p className="text-sm text-muted-foreground">
													{formatDistanceToNow(new Date(post.createdAt), {
														addSuffix: true,
													})}
												</p>
											</CardHeader>
											<CardContent className="pb-2">
												<p className="whitespace-pre-wrap">{post.content}</p>
											</CardContent>
											<CardFooter className="flex justify-between">
												<div className="flex items-center gap-6">
													<Button
														variant="ghost"
														size="sm"
														className="flex items-center gap-1"
														onClick={(e) => handleLike(post.id, e)}
														aria-label={
															post.isLiked ? "Unlike post" : "Like post"
														}
													>
														<Heart
															className={`h-5 w-5 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
														/>
														<span>{post.likeCount}</span>
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="flex items-center gap-1"
														onClick={(e) => {
															e.stopPropagation();
															handlePostClick(post.id);
														}}
														aria-label="View comments"
													>
														<MessageCircle className="h-5 w-5" />
														<span>{post.commentCount}</span>
													</Button>
												</div>
												<Button
													variant="ghost"
													size="sm"
													className="flex items-center gap-1"
													aria-label="Share post"
												>
													<Share2 className="h-5 w-5" />
												</Button>
											</CardFooter>
										</Card>
									))}
								</div>
							) : (
								<div className="py-8 text-center">
									<p className="text-muted-foreground">No posts yet.</p>
									{user.isCurrentUser && (
										<Button
											className="mt-4"
											onClick={() => router.push("/posts/new")}
										>
											Create Your First Post
										</Button>
									)}
								</div>
							)}
						</TabsContent>
						<TabsContent value="liked" className="mt-6">
							<div className="py-8 text-center">
								<p className="text-muted-foreground">
									Liked posts will appear here.
								</p>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			) : (
				<div className="py-8 text-center">
					<h3 className="text-xl font-semibold">User not found</h3>
					<p className="text-muted-foreground">
						The user you're looking for may not exist.
					</p>
					<Button className="mt-4" onClick={() => router.push("/feed")}>
						Return to Feed
					</Button>
				</div>
			)}
		</div>
	);
}
