"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar } from "@/components/search-bar";
import { cn } from "@/lib/utils";

export function Navbar() {
	const pathname = usePathname();
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 flex">
					<Link href="/" className="mr-6 flex items-center space-x-2">
						<span className="font-bold">Social App</span>
					</Link>
					<nav className="flex items-center space-x-6 text-sm font-medium">
						<Link
							href="/"
							className={cn(
								"transition-colors hover:text-foreground/80",
								pathname === "/" ? "text-foreground" : "text-foreground/60",
							)}
						>
							Home
						</Link>
						{isAuthenticated && (
							<Link
								href="/app"
								className={cn(
									"transition-colors hover:text-foreground/80",
									pathname?.startsWith("/app")
										? "text-foreground"
										: "text-foreground/60",
								)}
							>
								Timeline
							</Link>
						)}
					</nav>
				</div>

				{isAuthenticated && (
					<div className="mx-auto max-w-sm hidden md:block">
						<SearchBar />
					</div>
				)}

				<div className="flex flex-1 items-center justify-end space-x-4">
					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={session?.user?.image || ""}
											alt={session?.user?.name || ""}
										/>
										<AvatarFallback>
											{session?.user?.name
												? getInitials(session.user.name)
												: "U"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<div className="flex items-center justify-start gap-2 p-2">
									<div className="flex flex-col space-y-1 leading-none">
										{session?.user?.name && (
											<p className="font-medium">{session.user.name}</p>
										)}
										{session?.user?.email && (
											<p className="w-[200px] truncate text-sm text-muted-foreground">
												{session.user.email}
											</p>
										)}
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href={`/app/profile/${session?.user?.id}`}>
										Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer"
									onSelect={(event) => {
										event.preventDefault();
										signOut({ callbackUrl: "/" });
									}}
								>
									Sign out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<nav className="flex items-center space-x-2">
							<Link
								href="/signin"
								className={cn(
									buttonVariants({ variant: "ghost", size: "sm" }),
									"px-4",
								)}
							>
								Sign in
							</Link>
							<Link
								href="/signup"
								className={cn(buttonVariants({ size: "sm" }), "px-4")}
							>
								Sign up
							</Link>
						</nav>
					)}
				</div>
			</div>
		</header>
	);
}
