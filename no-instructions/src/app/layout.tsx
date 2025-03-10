import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Social Media App",
	description: "A simple social media application with posting functionality",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={cn(geistSans.variable, geistMono.variable, "antialiased")}
			>
				<AuthProvider>
					<div className="relative flex min-h-screen flex-col">
						<Navbar />
						<main className="flex-1">{children}</main>
					</div>
					<Toaster richColors position="top-center" />
				</AuthProvider>
			</body>
		</html>
	);
}
