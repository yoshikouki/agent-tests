import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
	const session = await getSession();

	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const { targetUserId } = await request.json();

		if (!targetUserId) {
			return NextResponse.json(
				{ message: "Target user ID is required" },
				{ status: 400 },
			);
		}

		// Check if target user exists
		const targetUser = await prisma.user.findUnique({
			where: { id: targetUserId },
		});

		if (!targetUser) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Cannot follow yourself
		if (session.user.id === targetUserId) {
			return NextResponse.json(
				{ message: "Cannot follow yourself" },
				{ status: 400 },
			);
		}

		// Check if already following
		const existingFollow = await prisma.follow.findFirst({
			where: {
				followerId: session.user.id,
				followingId: targetUserId,
			},
		});

		if (existingFollow) {
			return NextResponse.json(
				{ message: "Already following this user", isFollowing: true },
				{ status: 400 },
			);
		}

		// Create follow relationship
		const follow = await prisma.follow.create({
			data: {
				followerId: session.user.id,
				followingId: targetUserId,
			},
		});

		return NextResponse.json({ follow, isFollowing: true });
	} catch (error) {
		console.error("Error following user:", error);
		return NextResponse.json(
			{ message: "Failed to follow user" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	const session = await getSession();

	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const { targetUserId } = await request.json();

		if (!targetUserId) {
			return NextResponse.json(
				{ message: "Target user ID is required" },
				{ status: 400 },
			);
		}

		// Check if follow relationship exists
		const follow = await prisma.follow.findFirst({
			where: {
				followerId: session.user.id,
				followingId: targetUserId,
			},
		});

		if (!follow) {
			return NextResponse.json(
				{ message: "Not following this user", isFollowing: false },
				{ status: 400 },
			);
		}

		// Delete follow relationship
		await prisma.follow.delete({
			where: {
				id: follow.id,
			},
		});

		return NextResponse.json({ isFollowing: false });
	} catch (error) {
		console.error("Error unfollowing user:", error);
		return NextResponse.json(
			{ message: "Failed to unfollow user" },
			{ status: 500 },
		);
	}
}
