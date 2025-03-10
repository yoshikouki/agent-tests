import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

// This will handle all auth requests
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
