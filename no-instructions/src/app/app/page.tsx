"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Post } from "@/lib/models/post";
import { PostCard } from "@/components/posts/post-card";
import { PostForm } from "@/components/posts/post-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function TimelinePage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [editingPost, setEditingPost] = useState<Post | null>(null);

	useEffect(() => {
		// Redirect if not authenticated
		if (status === "unauthenticated") {
			router.push("/signin");
		} else if (status === "authenticated") {
			fetchPosts();
		}
	}, [status, router, page]);

	const fetchPosts = async () => {
		try {
			if (page === 0) {
				setIsLoading(true);
			} else {
				setIsLoadingMore(true);
			}

			const response = await fetch(`/api/posts?page=${page}`);

			if (!response.ok) {
				throw new Error("Failed to fetch posts");
			}

			const data = await response.json();

			if (page === 0) {
				setPosts(data.posts);
			} else {
				setPosts((prev) => [...prev, ...data.posts]);
			}

			setHasMore(data.pagination.hasNextPage);
		} catch (error) {
			console.error("Error fetching posts:", error);
			toast.error("Failed to load posts");
		} finally {
			setIsLoading(false);
			setIsLoadingMore(false);
		}
	};

	const handleCreatePost = async (values: { content: string }) => {
		try {
			const response = await fetch("/api/posts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Failed to create post");
			}

			const data = await response.json();
			setPosts((prev) => [data.post, ...prev]);
			toast.success("Post created successfully");
		} catch (error) {
			console.error("Error creating post:", error);
			toast.error("Failed to create post");
			throw error;
		}
	};

	const handleUpdatePost = async (values: { content: string }) => {
		if (!editingPost) return;

		try {
			const response = await fetch(`/api/posts/${editingPost.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Failed to update post");
			}

			const data = await response.json();

			setPosts((prev) =>
				prev.map((post) => (post.id === editingPost.id ? data.post : post)),
			);

			setEditingPost(null);
			toast.success("Post updated successfully");
		} catch (error) {
			console.error("Error updating post:", error);
			toast.error("Failed to update post");
			throw error;
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

	const handleLikePost = async (postId: string) => {
		// We'll implement this later with the like API
		console.log("Like post:", postId);
	};

	const handleLoadMore = () => {
		setPage((prev) => prev + 1);
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="container max-w-2xl py-8">
				<Skeleton className="h-32 w-full mb-4" />
				<div className="space-y-6">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-64 w-full" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-2xl py-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold mb-4">Home</h1>
				{editingPost ? (
					<div className="bg-card p-4 rounded-lg border">
						<div className="flex justify-between mb-4">
							<h2 className="font-medium">Edit Post</h2>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setEditingPost(null)}
							>
								Cancel
							</Button>
						</div>
						<PostForm
							initialData={editingPost}
							onSubmit={handleUpdatePost}
							isEditing={true}
						/>
					</div>
				) : (
					<div className="bg-card p-4 rounded-lg border">
						<h2 className="font-medium mb-4">Create a Post</h2>
						<PostForm onSubmit={handleCreatePost} />
					</div>
				)}
			</div>

			{posts.length === 0 && !isLoading ? (
				<div className="text-center py-12">
					<h2 className="text-xl font-medium mb-2">No posts yet</h2>
					<p className="text-muted-foreground">
						Create your first post or follow someone to see their posts.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							onDelete={handleDeletePost}
							onEdit={setEditingPost}
							onLike={handleLikePost}
						/>
					))}

					{hasMore && (
						<div className="flex justify-center pt-4">
							<Button
								variant="outline"
								onClick={handleLoadMore}
								disabled={isLoadingMore}
							>
								{isLoadingMore ? "Loading..." : "Load More"}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
