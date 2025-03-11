"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface User {
	id: string;
	name: string;
	email: string;
	profilePicture?: string;
}

export default function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const response = await fetch("/api/auth/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (response.ok) {
					const userData = await response.json();
					setUser(userData.user);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error("Error checking auth status:", error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuthStatus();
	}, []);

	const handleLogout = async () => {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});

			if (response.ok) {
				setUser(null);
				toast.success("Logged out successfully");
				router.push("/auth/login");
			} else {
				toast.error("Failed to logout");
			}
		} catch (error) {
			console.error("Error during logout:", error);
			toast.error("An error occurred during logout");
		}
	};

	const isAuthRoute = pathname?.startsWith("/auth");

	if (isAuthRoute) {
		return null;
	}

	return (
		<header className="sticky top-0 z-40 border-b bg-background">
			<div className="container flex h-16 items-center justify-between py-4">
				<div className="flex items-center gap-6 md:gap-10">
					<Link href="/" className="flex items-center space-x-2">
						<span className="text-xl font-bold">Social App</span>
					</Link>
					{!isLoading && user && (
						<nav className="hidden gap-6 md:flex">
							<Link
								href="/feed"
								className={`text-sm font-medium transition-colors hover:text-primary ${
									pathname === "/feed"
										? "text-primary"
										: "text-muted-foreground"
								}`}
							>
								Feed
							</Link>
							<Link
								href="/search"
								className={`text-sm font-medium transition-colors hover:text-primary ${
									pathname === "/search"
										? "text-primary"
										: "text-muted-foreground"
								}`}
							>
								Search
							</Link>
						</nav>
					)}
				</div>
				<div className="flex items-center gap-2">
					{isLoading ? (
						<div className="h-9 w-24 animate-pulse rounded bg-muted" />
					) : user ? (
						<div className="flex items-center gap-4">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage src={user.profilePicture} alt={user.name} />
											<AvatarFallback>
												{user.name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{user.name}
											</p>
											<p className="text-xs leading-none text-muted-foreground">
												{user.email}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => router.push(`/profile/${user.id}`)}
										className="cursor-pointer"
									>
										Profile
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={handleLogout}
										className="cursor-pointer"
									>
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : (
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => router.push("/auth/login")}
							>
								Log In
							</Button>
							<Button onClick={() => router.push("/auth/signup")}>
								Sign Up
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
