"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type Post = {
	id: string;
	content: string;
	createdAt: string;
	author: {
		id: string;
		name: string | null;
		username: string;
		avatarUrl: string | null;
	};
	_count: {
		likes: number;
		comments: number;
	};
	liked: boolean;
};

export function Timeline() {
	const { status } = useSession();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchPosts = useCallback(async (pageNum: number) => {
		try {
			setLoading(true);
			const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);

			if (!response.ok) {
				throw new Error("Failed to fetch posts");
			}

			const data = await response.json();

			if (pageNum === 1) {
				setPosts(data.posts);
			} else {
				setPosts((prev) => [...prev, ...data.posts]);
			}

			setHasMore(data.hasMore);
		} catch (error) {
			console.error("Error fetching posts:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPosts(1);
	}, [fetchPosts]);

	const loadMore = () => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchPosts(nextPage);
	};

	const handleLike = async (postId: string) => {
		if (status !== "authenticated") {
			return;
		}

		try {
			const response = await fetch(`/api/posts/${postId}/like`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to like post");
			}

			setPosts((prevPosts) =>
				prevPosts.map((post) =>
					post.id === postId
						? {
								...post,
								_count: {
									...post._count,
									likes: post.liked
										? post._count.likes - 1
										: post._count.likes + 1,
								},
								liked: !post.liked,
							}
						: post,
				),
			);
		} catch (error) {
			console.error("Error liking post:", error);
		}
	};

	if (loading && posts.length === 0) {
		return (
			<div className="space-y-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={`loading-skeleton-${i}`}>
						<CardHeader className="flex flex-row items-start gap-4 pb-2">
							<Skeleton className="h-12 w-12 rounded-full" />
							<div className="grid gap-1">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-16" />
							</div>
						</CardHeader>
						<Skeleton className="mx-4 mb-4 h-24" />
						<CardFooter className="flex justify-between">
							<Skeleton className="h-8 w-16" />
							<Skeleton className="h-8 w-16" />
						</CardFooter>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{posts.length === 0 && !loading ? (
				<div className="text-center py-12">
					<p className="text-xl text-muted-foreground">No posts to display</p>
					{status === "authenticated" ? (
						<div className="mt-4">
							<Link href="/posts/create">
								<Button>Create your first post</Button>
							</Link>
						</div>
					) : (
						<div className="mt-4">
							<Link href="/auth/signin">
								<Button>Sign in to post</Button>
							</Link>
						</div>
					)}
				</div>
			) : (
				<>
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							onLike={handleLike}
							isAuthenticated={status === "authenticated"}
						/>
					))}
					{hasMore && (
						<div className="flex justify-center pt-4">
							<Button variant="outline" onClick={loadMore} disabled={loading}>
								{loading ? "Loading..." : "Load more"}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

type PostCardProps = {
	post: Post;
	onLike: (postId: string) => void;
	isAuthenticated: boolean;
};

function PostCard({ post, onLike, isAuthenticated }: PostCardProps) {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-start gap-4 pb-2">
				<Avatar className="h-12 w-12">
					<AvatarImage
						src={post.author.avatarUrl || undefined}
						alt={post.author.name || ""}
					/>
					<AvatarFallback>
						{post.author.name
							? post.author.name.substring(0, 2).toUpperCase()
							: post.author.username.substring(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="grid gap-1">
					<div className="flex items-center gap-2">
						<Link href={`/profile/${post.author.id}`}>
							<CardTitle className="text-base hover:underline">
								{post.author.name || post.author.username}
							</CardTitle>
						</Link>
						<span className="text-xs text-muted-foreground">
							@{post.author.username}
						</span>
					</div>
					<CardDescription>{formatDate(post.createdAt)}</CardDescription>
				</div>
			</CardHeader>
			<div className="px-4 pb-4">
				<Link href={`/posts/${post.id}`}>
					<p className="text-base">{post.content}</p>
				</Link>
			</div>
			<CardFooter className="flex justify-between border-t px-6 py-3">
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-foreground"
						onClick={() => onLike(post.id)}
						disabled={!isAuthenticated}
					>
						{post.liked ? "♥" : "♡"} {post._count.likes}
					</Button>
				</div>
				<Link href={`/posts/${post.id}`}>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-foreground"
					>
						💬 {post._count.comments}
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}
