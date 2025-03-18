import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import CommentList from "@/components/comments/CommentList";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardHeader,
	CardFooter,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostPageProps {
	params: {
		postId: string;
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const { postId } = params;
	const session = await getSession();

	try {
		// Fetch post with author details
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				author: {
					include: {
						profile: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});

		if (!post) {
			notFound();
		}

		// Check if the current user has liked this post
		let liked = false;
		if (session?.user) {
			const like = await prisma.like.findFirst({
				where: {
					postId,
					userId: session.user.id,
				},
			});
			liked = !!like;
		}

		return (
			<div className="container py-6">
				<div className="mb-6">
					<Link href="/">
						<Button variant="ghost" className="pl-0">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Timeline
						</Button>
					</Link>
				</div>

				<Card className="mb-8">
					<CardHeader className="flex flex-row items-start gap-4 pb-2">
						<Avatar className="h-12 w-12">
							<AvatarImage
								src={post.author.profile?.avatarUrl || undefined}
								alt={post.author.profile?.name || ""}
							/>
							<AvatarFallback>
								{post.author.profile?.name
									? post.author.profile.name.substring(0, 2).toUpperCase()
									: post.author.profile?.username.substring(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="grid gap-1">
							<div className="flex items-center gap-2">
								<Link href={`/profile/${post.author.profile?.username}`}>
									<h2 className="text-xl font-bold hover:underline">
										{post.author.profile?.name || post.author.profile?.username}
									</h2>
								</Link>
								<span className="text-sm text-muted-foreground">
									@{post.author.profile?.username}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								{formatDistanceToNow(new Date(post.createdAt), {
									addSuffix: true,
								})}
							</p>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-lg whitespace-pre-wrap">{post.content}</p>
					</CardContent>
					<CardFooter className="flex justify-between border-t px-6 py-3">
						<div className="flex items-center text-muted-foreground">
							<span className="mr-4">♥ {post._count.likes} likes</span>
							<span>💬 {post._count.comments} comments</span>
						</div>
					</CardFooter>
				</Card>

				<div className="mt-8">
					<CommentList postId={postId} />
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error fetching post:", error);
		notFound();
	}
}
