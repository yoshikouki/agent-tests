"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignUp() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		name: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					username: formData.username,
					name: formData.name,
					password: formData.password,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to sign up");
			}

			// Redirect to sign in page on success
			router.push("/auth/signin");
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "An error occurred. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen py-12">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle className="text-2xl text-center">Create Account</CardTitle>
					<CardDescription className="text-center">
						Sign up for a new account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="your@email.com"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								name="username"
								type="text"
								value={formData.username}
								onChange={handleChange}
								placeholder="username"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								type="text"
								value={formData.name}
								onChange={handleChange}
								placeholder="Your Name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="••••••••"
								required
								minLength={8}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								value={formData.confirmPassword}
								onChange={handleChange}
								placeholder="••••••••"
								required
								minLength={8}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating Account..." : "Create Account"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<p className="text-sm text-center">
						Already have an account?{" "}
						<Link href="/auth/signin" className="underline hover:text-primary">
							Sign in
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
