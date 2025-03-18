import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/nav/main-nav";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Social Media App",
	description: "A simple social media application",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<div className="min-h-screen flex flex-col">
						<MainNav />
						<main className="flex-1">{children}</main>
					</div>
				</AuthProvider>
			</body>
		</html>
	);
}
