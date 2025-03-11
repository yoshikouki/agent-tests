import { NextResponse } from "next/server";
import { AuthService } from "@/application/services/AuthService";
import { UserRepositoryImpl } from "@/infrastructure/repositories/UserRepositoryImpl";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { emailOrUsername, password } = body;

		// Validate required fields
		if (!emailOrUsername || !password) {
			return NextResponse.json(
				{ error: "Email/username and password are required" },
				{ status: 400 },
			);
		}

		// Create repositories and services
		const userRepository = new UserRepositoryImpl();
		const authService = new AuthService({ userRepository });

		// Login user
		const { user, token } = await authService.login(emailOrUsername, password);

		// Return success response with user and token
		return NextResponse.json({
			message: "Login successful",
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
			token,
		});
	} catch (error) {
		console.error("Error during login:", error);

		// Handle invalid credentials error
		if (error instanceof Error && error.message === "Invalid credentials") {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		// Handle other errors
		return NextResponse.json({ error: "Failed to login" }, { status: 500 });
	}
}
