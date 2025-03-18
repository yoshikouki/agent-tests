import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// DELETE handler to remove a comment
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: { postId: string; commentId: string } },
) {
	const { commentId } = params;
	const session = await getSession();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Get the comment
		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			include: { post: true },
		});

		if (!comment) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		// Check if user is the author of the comment or the post
		const isCommentAuthor = comment.authorId === session.user.id;
		const isPostAuthor = comment.post.authorId === session.user.id;

		if (!isCommentAuthor && !isPostAuthor) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Delete the comment
		await prisma.comment.delete({
			where: { id: commentId },
		});

		return NextResponse.json(
			{ message: "Comment deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting comment:", error);
		return NextResponse.json(
			{ error: "Failed to delete comment" },
			{ status: 500 },
		);
	}
}
