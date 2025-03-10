import { registerUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Registration schema validation
const registrationSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate input
		const validation = registrationSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.flatten().fieldErrors },
				{ status: 400 },
			);
		}

		const { name, email, password } = validation.data;

		// Register the user
		const user = await registerUser(name, email, password);

		return NextResponse.json(
			{ user: { id: user.id, name: user.name, email: user.email } },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 },
		);
	}
}
