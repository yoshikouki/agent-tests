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
	MoreHorizontal,
	Trash,
	Edit,
	ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
	id: string;
	name: string;
	profilePicture?: string;
}

interface Post {
	id: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	user: User;
	likeCount: number;
	commentCount: number;
	isLiked: boolean;
	isOwner: boolean;
}

interface Comment {
	id: string;
	content: string;
	createdAt: string;
	user: User;
	isOwner: boolean;
}

const commentFormSchema = z.object({
	content: z
		.string()
		.min(1, { message: "Comment can't be empty" })
		.max(200, { message: "Comment can't exceed 200 characters" }),
});

export default function PostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCommentsLoading, setIsCommentsLoading] = useState(true);
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const commentForm = useForm<z.infer<typeof commentFormSchema>>({
		resolver: zodResolver(commentFormSchema),
		defaultValues: {
			content: "",
		},
	});

	useEffect(() => {
		fetchPost();
		fetchComments();
		fetchCurrentUser();
	}, []);

	const fetchPost = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/posts/${params.id}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				if (response.status === 404) {
					toast.error("Post not found");
					router.push("/feed");
					return;
				}
				if (response.status === 401) {
					router.push("/auth/login");
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
			setIsLoading(false);
		}
	};

	const fetchComments = async () => {
		setIsCommentsLoading(true);
		try {
			const response = await fetch(`/api/posts/${params.id}/comments`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch comments");
			}

			const data = await response.json();
			setComments(data.comments);
		} catch (error) {
			console.error("Error fetching comments:", error);
			toast.error("Failed to load comments");
		} finally {
			setIsCommentsLoading(false);
		}
	};

	const fetchCurrentUser = async () => {
		try {
			const response = await fetch("/api/auth/me", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				setCurrentUser(data.user);
			}
		} catch (error) {
			console.error("Error fetching current user:", error);
		}
	};

	const handleLike = async () => {
		if (!post) return;

		const isCurrentlyLiked = post.isLiked;

		// Optimistic update
		setPost({
			...post,
			isLiked: !isCurrentlyLiked,
			likeCount: isCurrentlyLiked ? post.likeCount - 1 : post.likeCount + 1,
		});

		try {
			const response = await fetch(`/api/posts/${post.id}/like`, {
				method: isCurrentlyLiked ? "DELETE" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				// Revert optimistic update if request fails
				setPost({
					...post,
					isLiked: isCurrentlyLiked,
					likeCount: isCurrentlyLiked ? post.likeCount : post.likeCount - 1,
				});
				throw new Error("Failed to update like");
			}
		} catch (error) {
			console.error("Error liking post:", error);
			toast.error("Failed to update like");
		}
	};

	const handlePostDelete = async () => {
		if (!post) return;

		try {
			const response = await fetch(`/api/posts/${post.id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete post");
			}

			toast.success("Post deleted successfully");
			router.push("/feed");
		} catch (error) {
			console.error("Error deleting post:", error);
			toast.error("Failed to delete post");
		}
	};

	const handlePostEdit = () => {
		if (!post) return;
		router.push(`/posts/${post.id}/edit`);
	};

	const handleCommentSubmit = async (
		values: z.infer<typeof commentFormSchema>,
	) => {
		setIsSubmittingComment(true);
		try {
			const response = await fetch(`/api/posts/${params.id}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Failed to post comment");
			}

			const data = await response.json();

			// Update comment list and post comment count
			setComments([data.comment, ...comments]);
			if (post) {
				setPost({
					...post,
					commentCount: post.commentCount + 1,
				});
			}

			toast.success("Comment posted successfully");
			commentForm.reset();
		} catch (error) {
			console.error("Error posting comment:", error);
			toast.error("Failed to post comment");
		} finally {
			setIsSubmittingComment(false);
		}
	};

	const handleCommentDelete = async (commentId: string) => {
		try {
			const response = await fetch(`/api/comments/${commentId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete comment");
			}

			// Update comment list and post comment count
			setComments(comments.filter((comment) => comment.id !== commentId));
			if (post) {
				setPost({
					...post,
					commentCount: post.commentCount - 1,
				});
			}

			toast.success("Comment deleted successfully");
		} catch (error) {
			console.error("Error deleting comment:", error);
			toast.error("Failed to delete comment");
		}
	};

	const navigateToUserProfile = (userId: string) => {
		router.push(`/profile/${userId}`);
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
				<Card>
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
			) : post ? (
				<>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<div className="flex items-center gap-4">
								<button
									type="button"
									className="p-0 bg-transparent border-0"
									onClick={() => navigateToUserProfile(post.user.id)}
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
										onClick={() => navigateToUserProfile(post.user.id)}
										aria-label={`View ${post.user.name}'s profile`}
									>
										{post.user.name}
									</button>
									<p className="text-sm text-muted-foreground">
										{formatDistanceToNow(new Date(post.createdAt), {
											addSuffix: true,
										})}
										{post.updatedAt !== post.createdAt && " (edited)"}
									</p>
								</div>
							</div>

							{post.isOwner && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="h-5 w-5" />
											<span className="sr-only">Post options</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={handlePostEdit}
											className="cursor-pointer"
										>
											<Edit className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<AlertDialog
											open={deleteDialogOpen}
											onOpenChange={setDeleteDialogOpen}
										>
											<AlertDialogTrigger asChild>
												<DropdownMenuItem
													onSelect={(e) => {
														e.preventDefault();
														setDeleteDialogOpen(true);
													}}
													className="cursor-pointer text-red-600"
												>
													<Trash className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Are you sure?</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be undone. This will permanently
														delete your post and all comments.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={handlePostDelete}
														className="bg-red-600 hover:bg-red-700"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</CardHeader>
						<CardContent className="pb-2">
							<p className="whitespace-pre-wrap text-lg">{post.content}</p>
						</CardContent>
						<CardFooter className="flex justify-between border-t pt-4">
							<div className="flex items-center gap-6">
								<Button
									variant="ghost"
									size="sm"
									className="flex items-center gap-1"
									onClick={handleLike}
									aria-label={post.isLiked ? "Unlike post" : "Like post"}
								>
									<Heart
										className={`h-5 w-5 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
									/>
									<span>{post.likeCount}</span>
								</Button>
								<div className="flex items-center gap-1">
									<MessageCircle className="h-5 w-5" />
									<span>{post.commentCount}</span>
								</div>
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

					<div className="mt-6 space-y-4">
						<h2 className="text-2xl font-bold">Comments</h2>

						{currentUser && (
							<Card>
								<CardContent className="pt-6">
									<Form {...commentForm}>
										<form
											onSubmit={commentForm.handleSubmit(handleCommentSubmit)}
											className="space-y-4"
										>
											<FormField
												control={commentForm.control}
												name="content"
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Textarea
																placeholder="Write a comment..."
																className="min-h-20 resize-none"
																{...field}
															/>
														</FormControl>
														<div className="flex justify-between">
															<FormMessage />
															<span
																className={`text-sm ${
																	field.value.length > 200
																		? "text-red-500"
																		: "text-gray-500"
																}`}
															>
																{field.value.length}/200
															</span>
														</div>
													</FormItem>
												)}
											/>
											<div className="flex justify-end">
												<Button type="submit" disabled={isSubmittingComment}>
													{isSubmittingComment ? "Posting..." : "Post Comment"}
												</Button>
											</div>
										</form>
									</Form>
								</CardContent>
							</Card>
						)}

						{isCommentsLoading ? (
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<Card key={i}>
										<CardHeader className="flex flex-row items-center gap-4 pb-2">
											<Skeleton className="h-8 w-8 rounded-full" />
											<div className="space-y-2">
												<Skeleton className="h-4 w-24" />
												<Skeleton className="h-3 w-16" />
											</div>
										</CardHeader>
										<CardContent>
											<Skeleton className="h-12 w-full" />
										</CardContent>
									</Card>
								))}
							</div>
						) : comments.length > 0 ? (
							<div className="space-y-4">
								{comments.map((comment) => (
									<Card key={comment.id}>
										<CardHeader className="flex flex-row items-center justify-between pb-2">
											<div className="flex items-center gap-4">
												<button
													type="button"
													className="p-0 bg-transparent border-0"
													onClick={() => navigateToUserProfile(comment.user.id)}
													aria-label={`View ${comment.user.name}'s profile`}
												>
													<Avatar className="h-8 w-8 cursor-pointer">
														<AvatarImage
															src={comment.user.profilePicture}
															alt={comment.user.name}
														/>
														<AvatarFallback>
															{comment.user.name
																.split(" ")
																.map((n) => n[0])
																.join("")
																.toUpperCase()}
														</AvatarFallback>
													</Avatar>
												</button>
												<div>
													<div className="flex items-center gap-2">
														<button
															type="button"
															className="p-0 bg-transparent border-0 font-semibold hover:underline text-left"
															onClick={() =>
																navigateToUserProfile(comment.user.id)
															}
															aria-label={`View ${comment.user.name}'s profile`}
														>
															{comment.user.name}
														</button>
														<span className="text-xs text-muted-foreground">
															{formatDistanceToNow(
																new Date(comment.createdAt),
																{ addSuffix: true },
															)}
														</span>
													</div>
												</div>
											</div>

											{comment.isOwner && (
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															aria-label="Delete comment"
														>
															<Trash className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete comment?
															</AlertDialogTitle>
															<AlertDialogDescription>
																This action cannot be undone. This will
																permanently delete your comment.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleCommentDelete(comment.id)}
																className="bg-red-600 hover:bg-red-700"
															>
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											)}
										</CardHeader>
										<CardContent>
											<p className="whitespace-pre-wrap">{comment.content}</p>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className="py-8 text-center">
								<p className="text-muted-foreground">
									No comments yet. Be the first to comment!
								</p>
							</div>
						)}
					</div>
				</>
			) : (
				<div className="py-8 text-center">
					<h3 className="text-xl font-semibold">Post not found</h3>
					<p className="text-muted-foreground">
						The post you're looking for may have been deleted or doesn't exist.
					</p>
					<Button className="mt-4" onClick={() => router.push("/feed")}>
						Return to Feed
					</Button>
				</div>
			)}
		</div>
	);
}
