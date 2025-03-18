import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Define validation schema using Zod
const userSchema = z.object({
	email: z.string().email("Invalid email address"),
	username: z.string().min(3, "Username must be at least 3 characters"),
	name: z.string().optional(),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validation = userSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ message: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { email, username, name, password } = validation.data;

		// Check if email already exists
		const existingUserByEmail = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUserByEmail) {
			return NextResponse.json(
				{ message: "Email already in use" },
				{ status: 400 },
			);
		}

		// Check if username already exists
		const existingUserByUsername = await prisma.profile.findUnique({
			where: { username },
		});

		if (existingUserByUsername) {
			return NextResponse.json(
				{ message: "Username already taken" },
				{ status: 400 },
			);
		}

		// Hash the password
		const hashedPassword = await hash(password, 10);

		// Create user and profile in a transaction
		const user = await prisma.$transaction(async (prisma) => {
			// Create the user
			const newUser = await prisma.user.create({
				data: {
					email,
					passwordHash: hashedPassword,
				},
			});

			// Create the profile
			await prisma.profile.create({
				data: {
					userId: newUser.id,
					username,
					name: name || null,
				},
			});

			return newUser;
		});

		return NextResponse.json(
			{ message: "User created successfully" },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ message: "Something went wrong" },
			{ status: 500 },
		);
	}
}
