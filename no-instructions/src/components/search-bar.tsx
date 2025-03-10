"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { SearchIcon, Loader2Icon } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface User {
	id: string;
	name: string;
	email: string;
	imageUrl: string | null;
}

export function SearchBar() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const debouncedQuery = useDebounce(query, 300);

	// Close search results when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Search for users when query changes
	useEffect(() => {
		const searchUsers = async () => {
			if (!debouncedQuery.trim()) {
				setResults([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);

			try {
				const response = await fetch(
					`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`,
				);

				if (!response.ok) {
					throw new Error("Failed to search users");
				}

				const data = await response.json();
				setResults(data.users);
				setIsOpen(true);
			} catch (error) {
				console.error("Error searching users:", error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		searchUsers();
	}, [debouncedQuery]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);

		if (e.target.value.trim()) {
			setIsLoading(true);
		} else {
			setIsOpen(false);
		}
	};

	const handleUserClick = (userId: string) => {
		setIsOpen(false);
		setQuery("");
		router.push(`/app/profile/${userId}`);
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<div className="relative w-full max-w-sm" ref={searchRef}>
			<div className="relative">
				<SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search users..."
					className="pl-8"
					value={query}
					onChange={handleChange}
					onFocus={() => {
						if (results.length > 0) {
							setIsOpen(true);
						}
					}}
				/>
				{isLoading && (
					<Loader2Icon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
				)}
			</div>

			{isOpen && (
				<Card className="absolute top-full z-10 mt-1 w-full overflow-hidden py-1">
					{results.length === 0 ? (
						<div className="px-4 py-3 text-sm text-muted-foreground">
							No users found
						</div>
					) : (
						<div className="max-h-80 overflow-auto">
							{results.map((user) => (
								<Button
									key={user.id}
									variant="ghost"
									className="w-full justify-start px-4 py-2 h-auto"
									onClick={() => handleUserClick(user.id)}
								>
									<div className="flex items-center gap-3">
										<Avatar className="h-8 w-8">
											<AvatarImage src={user.imageUrl || ""} alt={user.name} />
											<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
										</Avatar>
										<div className="text-left">
											<div className="font-medium">{user.name}</div>
											<div className="text-xs text-muted-foreground">
												{user.email}
											</div>
										</div>
									</div>
								</Button>
							))}
						</div>
					)}
				</Card>
			)}
		</div>
	);
}
