"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const router = useRouter();

	useEffect(() => {
		const checkAuthAndRedirect = async () => {
			try {
				const response = await fetch("/api/auth/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (response.ok) {
					// User is authenticated, redirect to feed
					router.push("/feed");
				} else {
					// User is not authenticated, redirect to login
					router.push("/auth/login");
				}
			} catch (error) {
				console.error("Error checking auth status:", error);
				router.push("/auth/login");
			}
		};

		checkAuthAndRedirect();
	}, [router]);

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="animate-pulse text-center">
				<h1 className="text-2xl font-bold">Loading...</h1>
				<p className="text-muted-foreground">
					Please wait while we redirect you
				</p>
			</div>
		</div>
	);
}
