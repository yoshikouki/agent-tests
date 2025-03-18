"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import CommentForm from "./CommentForm";

interface Author {
	id: string;
	profile: {
		username: string;
		name: string | null;
		avatarUrl: string | null;
	} | null;
}

interface Comment {
	id: string;
	content: string;
	createdAt: string;
	authorId: string;
	author: Author;
}

interface CommentListProps {
	postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
	const { data: session } = useSession();
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	const fetchComments = useCallback(
		async (pageNum = 1) => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`/api/posts/${postId}/comments?page=${pageNum}&limit=10`,
				);

				if (!response.ok) {
					throw new Error("Failed to fetch comments");
				}

				const data = await response.json();

				if (pageNum === 1) {
					setComments(data.comments);
				} else {
					setComments((prev) => [...prev, ...data.comments]);
				}

				setHasMore(data.pagination.page < data.pagination.totalPages);
				setPage(data.pagination.page);
			} catch (error) {
				toast.error("Failed to load comments");
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		},
		[postId],
	);

	useEffect(() => {
		fetchComments(1);
	}, [fetchComments]);

	const handleDelete = async (commentId: string) => {
		try {
			const response = await fetch(
				`/api/posts/${postId}/comments/${commentId}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete comment");
			}

			setComments(comments.filter((comment) => comment.id !== commentId));
			toast.success("Comment deleted successfully");
		} catch (error) {
			toast.error("Failed to delete comment");
			console.error(error);
		}
	};

	const handleLoadMore = () => {
		fetchComments(page + 1);
	};

	const refreshComments = () => {
		fetchComments(1);
	};

	return (
		<div className="space-y-6">
			<CommentForm postId={postId} onSuccess={refreshComments} />

			<div className="space-y-4">
				<h3 className="text-lg font-medium">Comments</h3>

				{isLoading && page === 1 ? (
					<div className="space-y-3">
						{[...Array(3)].map((_, i) => (
							<Card key={`skeleton-${i}`}>
								<CardContent className="py-3">
									<div className="flex items-start gap-3">
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="space-y-2 flex-1">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-full" />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : comments.length === 0 ? (
					<p className="text-muted-foreground text-center py-4">
						No comments yet.
					</p>
				) : (
					<div className="space-y-3">
						{comments.map((comment) => (
							<Card key={comment.id}>
								<CardContent className="py-3">
									<div className="flex items-start gap-3">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={comment.author.profile?.avatarUrl || ""}
												alt={
													comment.author.profile?.name ||
													comment.author.profile?.username ||
													"User"
												}
											/>
											<AvatarFallback>
												{comment.author.profile?.name?.[0] ||
													comment.author.profile?.username?.[0] ||
													"U"}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<div className="flex justify-between items-start">
												<div>
													<p className="font-medium">
														{comment.author.profile?.name ||
															comment.author.profile?.username}
													</p>
													<p className="text-xs text-muted-foreground">
														{formatDistanceToNow(new Date(comment.createdAt), {
															addSuffix: true,
														})}
													</p>
												</div>
												{session?.user?.email &&
													comment.authorId === comment.author.id && (
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7"
															onClick={() => handleDelete(comment.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													)}
											</div>
											<p className="mt-1 text-sm">{comment.content}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{hasMore && (
					<CardFooter className="flex justify-center">
						<Button
							variant="outline"
							size="sm"
							onClick={handleLoadMore}
							disabled={isLoading}
						>
							{isLoading ? "Loading..." : "Load More"}
						</Button>
					</CardFooter>
				)}
			</div>
		</div>
	);
}
