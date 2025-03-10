import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { compare, hash } from "bcrypt";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import NextAuth from "next-auth";

export const authConfig: NextAuthConfig = {
	// Add a secret key for NextAuth
	secret:
		process.env.NEXTAUTH_SECRET ||
		"THIS_IS_A_SECRET_KEY_CHANGE_IT_IN_PRODUCTION",
	pages: {
		signIn: "/signin",
		// Next-auth doesn't have a built-in signUp page option
		// We'll handle this in our own routes
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnApp = nextUrl.pathname.startsWith("/app");

			// If accessing protected routes and not logged in, redirect to sign-in
			if (isOnApp && !isLoggedIn) {
				return false;
			}

			return true;
		},
		jwt({ token, user }) {
			// Add user ID to the token when signing in
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			// Add user ID from token to session
			if (token && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const validatedCredentials = z
					.object({
						email: z.string().email(),
						password: z.string().min(8),
					})
					.safeParse(credentials);

				if (!validatedCredentials.success) {
					return null;
				}

				const { email, password } = validatedCredentials.data;

				const db = await getDb();
				const user = await db.get("SELECT * FROM users WHERE email = ?", email);

				if (!user) {
					return null;
				}

				const passwordMatch = await compare(password, user.password_hash);

				if (!passwordMatch) {
					return null;
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image_url,
				};
			},
		}),
	],
};

/**
 * Register a new user
 */
export async function registerUser(
	name: string,
	email: string,
	password: string,
) {
	const db = await getDb();

	// Check if user already exists
	const existingUser = await db.get(
		"SELECT * FROM users WHERE email = ?",
		email,
	);

	if (existingUser) {
		throw new Error("User with this email already exists");
	}

	// Hash password
	const passwordHash = await hash(password, 10);

	// Create user
	const userId = uuid();

	await db.run(
		"INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
		userId,
		name,
		email,
		passwordHash,
	);

	return {
		id: userId,
		name,
		email,
	};
}

// Create a NextAuth instance with our config
const nextAuth = NextAuth(authConfig);

// Export the auth function for use in API routes
export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
export const handlers = nextAuth.handlers;
