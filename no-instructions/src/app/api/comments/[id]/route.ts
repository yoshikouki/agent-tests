import { deleteComment } from "@/lib/models/comment";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// DELETE handler for deleting a comment
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const commentId = params.id;

	try {
		const success = await deleteComment(commentId, session.user.id as string);

		if (!success) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		return NextResponse.json(
			{ message: "Comment deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting comment:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to delete comment" },
			{ status: 500 },
		);
	}
}
