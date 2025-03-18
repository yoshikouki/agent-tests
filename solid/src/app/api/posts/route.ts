import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const offset = (page - 1) * limit;

		// Get current user session
		const session = await getServerSession();
		const userId = session?.user ? (session.user as any).id : null;

		// Fetch posts with pagination
		const posts = await prisma.post.findMany({
			take: limit,
			skip: offset,
			orderBy: {
				createdAt: "desc",
			},
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
				likes: userId
					? {
							where: {
								userId,
							},
							select: {
								id: true,
							},
						}
					: undefined,
			},
		});

		// Get total count for pagination
		const totalPosts = await prisma.post.count();
		const hasMore = offset + posts.length < totalPosts;

		// Format posts
		const formattedPosts = posts.map((post) => ({
			id: post.id,
			content: post.content,
			createdAt: post.createdAt.toISOString(),
			author: {
				id: post.author.id,
				name: post.author.profile?.name,
				username: post.author.profile?.username || "",
				avatarUrl: post.author.profile?.avatarUrl,
			},
			_count: {
				likes: post._count.likes,
				comments: post._count.comments,
			},
			liked: userId ? post.likes.length > 0 : false,
		}));

		return NextResponse.json({
			posts: formattedPosts,
			hasMore,
			total: totalPosts,
		});
	} catch (error) {
		console.error("Error fetching posts:", error);
		return NextResponse.json(
			{ message: "Error fetching posts" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession();

		if (!session?.user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const userId = (session.user as any).id;
		const { content } = await request.json();

		if (!content || content.trim() === "") {
			return NextResponse.json(
				{ message: "Post content is required" },
				{ status: 400 },
			);
		}

		const post = await prisma.post.create({
			data: {
				content,
				authorId: userId,
			},
			include: {
				author: {
					include: {
						profile: true,
					},
				},
			},
		});

		return NextResponse.json(
			{
				post: {
					id: post.id,
					content: post.content,
					createdAt: post.createdAt.toISOString(),
					author: {
						id: post.author.id,
						name: post.author.profile?.name,
						username: post.author.profile?.username || "",
						avatarUrl: post.author.profile?.avatarUrl,
					},
					_count: {
						likes: 0,
						comments: 0,
					},
					liked: false,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating post:", error);
		return NextResponse.json(
			{ message: "Error creating post" },
			{ status: 500 },
		);
	}
}
