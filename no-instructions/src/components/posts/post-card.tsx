"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Post } from "@/lib/models/post";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	HeartIcon,
	MessageCircleIcon,
	MoreHorizontalIcon,
	EditIcon,
	TrashIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
	post: Post;
	onDelete?: (postId: string) => Promise<void>;
	onEdit?: (post: Post) => void;
	onLike?: (postId: string) => Promise<void>;
}

export function PostCard({ post, onDelete, onEdit, onLike }: PostCardProps) {
	const { data: session } = useSession();
	const [isLiking, setIsLiking] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isCurrentUserPost = session?.user?.id === post.userId;
	const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
		addSuffix: true,
	});

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const handleLike = async () => {
		if (!onLike || isLiking) return;

		setIsLiking(true);
		try {
			await onLike(post.id);
		} finally {
			setIsLiking(false);
		}
	};

	const handleDelete = async () => {
		if (!onDelete || isDeleting) return;

		if (window.confirm("Are you sure you want to delete this post?")) {
			setIsDeleting(true);
			try {
				await onDelete(post.id);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const handleEdit = () => {
		if (onEdit) {
			onEdit(post);
		}
	};

	return (
		<Card className="mb-4">
			<CardHeader className="pb-2 space-y-0 flex flex-row justify-between">
				<div className="flex items-center space-x-3">
					<Link href={`/app/profile/${post.userId}`}>
						<Avatar>
							<AvatarImage src={post.userImage || ""} alt={post.userName} />
							<AvatarFallback>{getInitials(post.userName)}</AvatarFallback>
						</Avatar>
					</Link>
					<div>
						<Link
							href={`/app/profile/${post.userId}`}
							className="font-medium hover:underline"
						>
							{post.userName}
						</Link>
						<p className="text-sm text-muted-foreground">{formattedDate}</p>
					</div>
				</div>

				{isCurrentUserPost && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontalIcon className="h-4 w-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleEdit} disabled={!onEdit}>
								<EditIcon className="mr-2 h-4 w-4" />
								<span>Edit</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleDelete}
								disabled={isDeleting || !onDelete}
								className="text-destructive focus:text-destructive"
							>
								<TrashIcon className="mr-2 h-4 w-4" />
								<span>{isDeleting ? "Deleting..." : "Delete"}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</CardHeader>

			<CardContent className="py-4">
				<p className="whitespace-pre-wrap">{post.content}</p>
			</CardContent>

			<CardFooter className="border-t px-6 py-3 flex justify-between">
				<div className="flex items-center space-x-6">
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"flex items-center gap-1 px-2",
							post.hasLiked && "text-red-500 hover:text-red-600",
						)}
						onClick={handleLike}
						disabled={isLiking}
					>
						<HeartIcon
							className="h-4 w-4"
							fill={post.hasLiked ? "currentColor" : "none"}
						/>
						<span>{post.likeCount || 0}</span>
					</Button>

					<Link
						href={`/app/posts/${post.id}`}
						className="flex items-center gap-1 hover:text-primary"
					>
						<MessageCircleIcon className="h-4 w-4" />
						<span>{post.commentCount || 0}</span>
					</Link>
				</div>
			</CardFooter>
		</Card>
	);
}
