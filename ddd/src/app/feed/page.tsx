"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface User {
	id: string;
	name: string;
	profilePicture?: string;
}

interface Post {
	id: string;
	content: string;
	createdAt: string;
	user: User;
	likeCount: number;
	commentCount: number;
	isLiked: boolean;
}

interface PostsResponse {
	posts: Post[];
	total: number;
	page: number;
	limit: number;
}

export default function FeedPage() {
	const router = useRouter();
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		fetchPosts(page);
	}, [page]);

	const fetchPosts = async (pageNum: number) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/posts?page=${pageNum}&limit=10`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					router.push("/auth/login");
					return;
				}
				throw new Error("Failed to fetch posts");
			}

			const data: PostsResponse = await response.json();
			setPosts(data.posts);
			setTotalPages(Math.ceil(data.total / data.limit));
		} catch (error) {
			console.error("Error fetching posts:", error);
			toast.error("Failed to load posts");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLike = async (postId: string) => {
		try {
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
									likeCount: isCurrentlyLiked ? p.likeCount : p.likeCount,
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

	const navigateToPostDetail = (postId: string) => {
		router.push(`/posts/${postId}`);
	};

	const navigateToUserProfile = (userId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/profile/${userId}`);
	};

	const handleUserKeyDown = (userId: string, e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.stopPropagation();
			router.push(`/profile/${userId}`);
		}
	};

	return (
		<div className="container max-w-4xl py-6">
			<h1 className="mb-6 text-3xl font-bold">Feed</h1>

			{isLoading ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="cursor-pointer hover:shadow-md">
							<CardHeader className="flex flex-row items-center gap-4 pb-2">
								<Skeleton className="h-12 w-12 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
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
			) : posts.length === 0 ? (
				<div className="mt-10 text-center">
					<h3 className="text-xl font-semibold">No posts yet</h3>
					<p className="text-muted-foreground">
						Be the first to post something!
					</p>
					<Button className="mt-4" onClick={() => router.push("/posts/new")}>
						Create Post
					</Button>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{posts.map((post) => (
							<Card
								key={post.id}
								className="cursor-pointer hover:shadow-md"
								onClick={() => navigateToPostDetail(post.id)}
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										navigateToPostDetail(post.id);
									}
								}}
							>
								<CardHeader className="flex flex-row items-center gap-4 pb-2">
									<button
										type="button"
										className="p-0 bg-transparent border-0"
										onClick={(e) => navigateToUserProfile(post.user.id, e)}
										onKeyDown={(e) => handleUserKeyDown(post.user.id, e)}
										aria-label={`View ${post.user.name}'s profile`}
									>
										<Avatar className="h-12 w-12 cursor-pointer">
											<AvatarImage
												src={post.user.profilePicture}
												alt={post.user.name}
											/>
											<AvatarFallback>
												{post.user.name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</button>
									<div>
										<button
											type="button"
											className="p-0 bg-transparent border-0 font-semibold hover:underline text-left"
											onClick={(e) => navigateToUserProfile(post.user.id, e)}
											onKeyDown={(e) => handleUserKeyDown(post.user.id, e)}
											aria-label={`View ${post.user.name}'s profile`}
										>
											{post.user.name}
										</button>
										<p className="text-sm text-muted-foreground">
											{formatDistanceToNow(new Date(post.createdAt), {
												addSuffix: true,
											})}
										</p>
									</div>
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
											onClick={(e) => {
												e.stopPropagation();
												handleLike(post.id);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.stopPropagation();
													handleLike(post.id);
												}
											}}
											aria-label={post.isLiked ? "Unlike post" : "Like post"}
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
												navigateToPostDetail(post.id);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.stopPropagation();
													navigateToPostDetail(post.id);
												}
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

					<div className="mt-6">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (page > 1) setPage(page - 1);
										}}
										className={
											page <= 1 ? "pointer-events-none opacity-50" : ""
										}
									/>
								</PaginationItem>

								{Array.from(
									{ length: Math.min(5, totalPages) },
									(_, i: number) => {
										// Logic to show relevant page numbers
										let pageNum: number;
										if (totalPages <= 5) {
											pageNum = i + 1;
										} else if (page <= 3) {
											pageNum = i + 1;
										} else if (page >= totalPages - 2) {
											pageNum = totalPages - 4 + i;
										} else {
											pageNum = page - 2 + i;
										}

										return (
											<PaginationItem key={pageNum}>
												<PaginationLink
													href="#"
													onClick={(e) => {
														e.preventDefault();
														setPage(pageNum);
													}}
													isActive={pageNum === page}
												>
													{pageNum}
												</PaginationLink>
											</PaginationItem>
										);
									},
								)}

								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (page < totalPages) setPage(page + 1);
										}}
										className={
											page >= totalPages ? "pointer-events-none opacity-50" : ""
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>

					<div className="fixed bottom-6 right-6">
						<Button
							size="lg"
							className="rounded-full h-14 w-14 shadow-lg"
							onClick={() => router.push("/posts/new")}
						>
							+
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
