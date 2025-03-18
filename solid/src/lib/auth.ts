import { cookies } from "next/headers";
import { prisma } from "./db";
import jwt from "jsonwebtoken";

export interface SessionUser {
	id: string;
	email: string;
}

export interface Session {
	user: SessionUser;
}

export async function getSession(): Promise<Session | null> {
	const cookieStore = cookies();
	const token = cookieStore.get("authToken")?.value;

	if (!token) {
		return null;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			userId: string;
		};

		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, email: true },
		});

		if (!user) {
			return null;
		}

		return { user };
	} catch (error) {
		return null;
	}
}
