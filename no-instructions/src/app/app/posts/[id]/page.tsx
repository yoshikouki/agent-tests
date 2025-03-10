"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/lib/models/post";
import { Comment } from "@/lib/models/comment";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";

// Form schema
const commentSchema = z.object({
	content: z
		.string()
		.min(1, "Comment cannot be empty")
		.max(500, "Comment is too long"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export default function PostPage() {
	const params = useParams();
	const router = useRouter();
	const postId = params.id as string;
	const { data: session, status } = useSession();

	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoadingPost, setIsLoadingPost] = useState(true);
	const [isLoadingComments, setIsLoadingComments] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<CommentFormValues>({
		resolver: zodResolver(commentSchema),
		defaultValues: {
			content: "",
		},
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/signin");
			return;
		}

		fetchPost();
		fetchComments();
	}, [postId, status, router]);

	const fetchPost = async () => {
		try {
			setIsLoadingPost(true);
			const response = await fetch(`/api/posts/${postId}`);

			if (!response.ok) {
				if (response.status === 404) {
					toast.error("Post not found");
					router.push("/app");
					return;
				}
				throw new Error("Failed to fetch post");
			}

			const data = await response.json();
			setPost(data.post);
		} catch (error) {
			console.error("Error fetching post:", error);
			toast.error("Failed to load post");
		} finally {
			setIsLoadingPost(false);
		}
	};

	const fetchComments = async () => {
		try {
			setIsLoadingComments(true);
			const response = await fetch(`/api/posts/${postId}/comments`);

			if (!response.ok) {
				throw new Error("Failed to fetch comments");
			}

			const data = await response.json();
			setComments(data.comments);
		} catch (error) {
			console.error("Error fetching comments:", error);
			toast.error("Failed to load comments");
		} finally {
			setIsLoadingComments(false);
		}
	};

	const handleSubmitComment = async (values: CommentFormValues) => {
		if (!session?.user) {
			toast.error("You must be logged in to comment");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Failed to post comment");
			}

			const data = await response.json();
			setComments((prev) => [data.comment, ...prev]);
			form.reset();
			toast.success("Comment posted successfully");
		} catch (error) {
			console.error("Error posting comment:", error);
			toast.error("Failed to post comment");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		try {
			const response = await fetch(`/api/comments/${commentId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete comment");
			}

			setComments((prev) => prev.filter((comment) => comment.id !== commentId));
			toast.success("Comment deleted successfully");
		} catch (error) {
			console.error("Error deleting comment:", error);
			toast.error("Failed to delete comment");
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

			toast.success("Post deleted successfully");
			router.push("/app");
		} catch (error) {
			console.error("Error deleting post:", error);
			toast.error("Failed to delete post");
		}
	};

	const handleLikePost = async (postId: string) => {
		if (!post) return;

		try {
			const method = post.hasLiked ? "DELETE" : "POST";
			const response = await fetch(`/api/posts/${postId}/like`, {
				method,
			});

			if (!response.ok) {
				throw new Error(`Failed to ${post.hasLiked ? "unlike" : "like"} post`);
			}

			const data = await response.json();

			setPost({
				...post,
				hasLiked: !post.hasLiked,
				likeCount: data.likeCount,
			});

			toast.success(post.hasLiked ? "Post unliked" : "Post liked");
		} catch (error) {
			console.error("Error liking/unliking post:", error);
			toast.error(`Failed to ${post.hasLiked ? "unlike" : "like"} post`);
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

	if (status === "loading" || isLoadingPost) {
		return (
			<div className="container max-w-3xl py-8">
				<Skeleton className="h-64 w-full mb-8" />
				<div className="space-y-4">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="container max-w-3xl py-8">
				<div className="text-center py-12">
					<h2 className="text-xl font-medium mb-2">Post not found</h2>
					<p className="text-muted-foreground mb-6">
						The post you are looking for does not exist or has been deleted.
					</p>
					<Button onClick={() => router.push("/app")}>Return to Home</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-3xl py-8">
			<Button variant="ghost" className="mb-4" onClick={() => router.back()}>
				← Back
			</Button>

			<div className="mb-8">
				<PostCard
					post={post}
					onDelete={
						post.userId === session?.user?.id ? handleDeletePost : undefined
					}
					onLike={handleLikePost}
				/>
			</div>

			<div className="mb-8">
				<h2 className="text-xl font-medium mb-4">Comments</h2>

				{session?.user && (
					<div className="mb-6">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleSubmitComment)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="content"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Textarea
													placeholder="Write a comment..."
													className="min-h-[80px] resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="flex justify-end">
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Posting..." : "Post Comment"}
									</Button>
								</div>
							</form>
						</Form>
					</div>
				)}

				{isLoadingComments ? (
					<div className="space-y-4">
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-24 w-full" />
					</div>
				) : comments.length === 0 ? (
					<div className="text-center py-6 bg-muted/30 rounded-lg">
						<p className="text-muted-foreground">
							No comments yet. Be the first to comment!
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{comments.map((comment) => (
							<Card key={comment.id}>
								<CardHeader className="pb-2 space-y-0 flex items-start justify-between">
									<div className="flex items-start space-x-3">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={comment.userImage || ""}
												alt={comment.userName}
											/>
											<AvatarFallback>
												{getInitials(comment.userName)}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="font-medium">{comment.userName}</div>
											<p className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(comment.createdAt), {
													addSuffix: true,
												})}
											</p>
										</div>
									</div>

									{comment.userId === session?.user?.id && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDeleteComment(comment.id)}
										>
											Delete
										</Button>
									)}
								</CardHeader>

								<CardContent>
									<p className="whitespace-pre-wrap text-sm">
										{comment.content}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
