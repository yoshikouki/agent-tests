"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { UserSearch } from "./components";

export default function SearchPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	return (
		<div className="container py-6">
			<h1 className="text-2xl font-bold mb-6">Search Users</h1>

			<form onSubmit={handleSearch} className="mb-8">
				<div className="flex gap-2">
					<Input
						type="text"
						placeholder="Search by username or name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1"
					/>
					<Button type="submit">Search</Button>
				</div>
			</form>

			<UserSearch query={searchParams.get("q") || ""} />
		</div>
	);
}
