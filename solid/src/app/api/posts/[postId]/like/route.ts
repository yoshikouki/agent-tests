import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface Params {
	params: {
		postId: string;
	};
}

export async function POST(request: Request, { params }: Params) {
	try {
		const session = await getServerSession();

		if (!session?.user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const userId = (session.user as { id: string }).id;
		const { postId } = params;

		// Check if post exists
		const post = await prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			return NextResponse.json({ message: "Post not found" }, { status: 404 });
		}

		// Check if user has already liked the post
		const existingLike = await prisma.like.findUnique({
			where: {
				postId_userId: {
					postId,
					userId,
				},
			},
		});

		if (existingLike) {
			// Unlike the post
			await prisma.like.delete({
				where: {
					id: existingLike.id,
				},
			});

			return NextResponse.json({ liked: false });
		} else {
			// Like the post
			await prisma.like.create({
				data: {
					postId,
					userId,
				},
			});

			return NextResponse.json({ liked: true });
		}
	} catch (error) {
		console.error("Error handling like:", error);
		return NextResponse.json(
			{ message: "Error processing like" },
			{ status: 500 },
		);
	}
}
