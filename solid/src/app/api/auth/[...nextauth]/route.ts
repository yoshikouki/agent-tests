import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
					include: {
						profile: true,
					},
				});

				if (!user) {
					return null;
				}

				const isPasswordValid = await compare(
					credentials.password,
					user.passwordHash,
				);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.profile?.name || user.profile?.username || user.email,
					image: user.profile?.avatarUrl,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/auth/signin",
	},
	callbacks: {
		async session({ session, token }) {
			if (token.sub && session.user) {
				session.user = {
					...session.user,
					id: token.sub,
				};
			}
			return session;
		},
	},
});

export { handler as GET, handler as POST };
