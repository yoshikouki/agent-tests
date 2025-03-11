import { NextResponse } from "next/server";
import { AuthService } from "@/application/services/AuthService";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { username, email, password } = body;

		// Validate required fields
		if (!username || !email || !password) {
			return NextResponse.json(
				{ error: "Username, email, and password are required" },
				{ status: 400 },
			);
		}

		// Create repositories and services
		const userRepository = new UserRepositoryImpl();
		const authService = new AuthService({ userRepository });

		// Signup user
		const { user, token } = await authService.signup(username, email, password);

		// Return success response with user and token
		return NextResponse.json(
			{
				message: "User registered successfully",
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
				},
				token,
			},
			{ status: 201 },
		);
	} catch (error: any) {
		console.error("Error during signup:", error);

		// Handle known errors
		if (
			error.message === "User with this email already exists" ||
			error.message === "Username already taken"
		) {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}

		// Handle other errors
		return NextResponse.json(
			{ error: "Failed to register user" },
			{ status: 500 },
		);
	}
}
