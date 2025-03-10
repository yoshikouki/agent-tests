import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET user profile
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const userId = params.id;

	try {
		const db = await getDb();

		// Get user details
		const user = await db.get(
			`
      SELECT 
        id, 
        name, 
        email, 
        bio, 
        image_url as imageUrl, 
        created_at as createdAt
      FROM users 
      WHERE id = ?
    `,
			userId,
		);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Count followers
		const followersCount = await db.get(
			"SELECT COUNT(*) as count FROM follows WHERE following_id = ?",
			userId,
		);

		// Count following
		const followingCount = await db.get(
			"SELECT COUNT(*) as count FROM follows WHERE follower_id = ?",
			userId,
		);

		// Check if the current user is following this user
		const session = await auth();
		let isFollowing = false;

		if (session?.user?.id && session.user.id !== userId) {
			const followRecord = await db.get(
				"SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
				session.user.id as string,
				userId,
			);
			isFollowing = !!followRecord;
		}

		return NextResponse.json({
			user: {
				...user,
				createdAt: new Date(user.createdAt * 1000),
				followersCount: followersCount?.count || 0,
				followingCount: followingCount?.count || 0,
				isFollowing,
				isCurrentUser: session?.user?.id === userId,
			},
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user information" },
			{ status: 500 },
		);
	}
}

// PATCH user profile (for updating)
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = params.id;

	// Only allow users to update their own profile
	if (session.user.id !== userId) {
		return NextResponse.json(
			{ error: "You can only update your own profile" },
			{ status: 403 },
		);
	}

	try {
		const body = await request.json();
		const { name, bio, imageUrl } = body;

		const db = await getDb();
		const now = Math.floor(Date.now() / 1000);

		// Only update provided fields
		const updates = [];
		const values = [];

		if (name !== undefined) {
			updates.push("name = ?");
			values.push(name);
		}

		if (bio !== undefined) {
			updates.push("bio = ?");
			values.push(bio);
		}

		if (imageUrl !== undefined) {
			updates.push("image_url = ?");
			values.push(imageUrl);
		}

		if (updates.length > 0) {
			updates.push("updated_at = ?");
			values.push(now);

			// Add userId as the last parameter
			values.push(userId);

			await db.run(
				`UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
				...values,
			);

			// Get updated user
			const updatedUser = await db.get(
				`
        SELECT 
          id, 
          name, 
          email, 
          bio, 
          image_url as imageUrl, 
          created_at as createdAt,
          updated_at as updatedAt
        FROM users 
        WHERE id = ?
      `,
				userId,
			);

			return NextResponse.json({
				user: {
					...updatedUser,
					createdAt: new Date(updatedUser.createdAt * 1000),
					updatedAt: new Date(updatedUser.updatedAt * 1000),
				},
			});
		} else {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 },
			);
		}
	} catch (error) {
		console.error("Error updating user:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 },
		);
	}
}
