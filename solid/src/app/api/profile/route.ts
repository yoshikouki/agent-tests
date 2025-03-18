import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfile } from "@/lib/profile";

export async function GET() {
	const session = await getSession();

	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const profile = await prisma.profile.findUnique({
		where: { userId: session.user.id },
		include: {
			user: {
				select: {
					email: true,
				},
			},
		},
	});

	if (!profile) {
		return NextResponse.json({ message: "Profile not found" }, { status: 404 });
	}

	return NextResponse.json({
		...profile,
		email: profile.user.email,
	});
}

export async function PUT(request: NextRequest) {
	const session = await getSession();

	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();

		// Validate input
		if (!body.username || body.username.trim() === "") {
			return NextResponse.json(
				{ message: "Username is required" },
				{ status: 400 },
			);
		}

		// Check if username already exists for other users
		const existingProfile = await prisma.profile.findUnique({
			where: { username: body.username },
		});

		if (existingProfile && existingProfile.userId !== session.user.id) {
			return NextResponse.json(
				{ message: "Username already taken" },
				{ status: 400 },
			);
		}

		// Update profile
		const updatedProfile = await updateProfile(session.user.id, {
			username: body.username,
			name: body.name,
			bio: body.bio,
			avatarUrl: body.avatarUrl,
		});

		return NextResponse.json(updatedProfile);
	} catch (error) {
		console.error("Error updating profile:", error);
		return NextResponse.json(
			{ message: "Failed to update profile" },
			{ status: 500 },
		);
	}
}
