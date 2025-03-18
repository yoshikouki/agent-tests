"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
import { Search } from "lucide-react";

export function MainNav() {
	const pathname = usePathname();
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";

	const navItems = [
		{ name: "Home", href: "/" },
		{ name: "Explore", href: "/explore" },
	];

	return (
		<nav className="border-b">
			<div className="flex h-16 items-center px-4 mx-auto max-w-7xl">
				<div className="flex items-center space-x-4">
					<Link href="/" className="font-bold text-xl">
						SocialApp
					</Link>
					<div className="hidden md:flex items-center space-x-4">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`text-sm font-medium transition-colors hover:text-primary ${
									pathname === item.href
										? "text-primary"
										: "text-muted-foreground"
								}`}
							>
								{item.name}
							</Link>
						))}
					</div>
				</div>
				<div className="ml-auto flex items-center space-x-4">
					{isAuthenticated ? (
						<>
							<Link href="/search" className="p-2 rounded-full hover:bg-accent">
								<Search className="h-5 w-5" />
							</Link>
							<Link href="/posts/create">
								<Button variant="outline" size="sm">
									New Post
								</Button>
							</Link>
							<DropdownMenu>
								<DropdownMenuTrigger>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={session.user?.image || undefined}
											alt={session.user?.name || ""}
										/>
										<AvatarFallback>
											{session.user?.name
												? session.user.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()
												: "U"}
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>
										{session.user?.name || session.user?.email}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link href="/profile">Profile</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/settings">Settings</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => signOut({ callbackUrl: "/" })}
									>
										Sign out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					) : (
						<>
							<Link href="/auth/signin">
								<Button variant="ghost" size="sm">
									Sign in
								</Button>
							</Link>
							<Link href="/auth/signup">
								<Button size="sm">Sign up</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
