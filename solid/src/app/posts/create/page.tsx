"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreatePost() {
	const router = useRouter();
	const [content, setContent] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const maxLength = 280;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!content.trim()) {
			setError("Post content cannot be empty");
			return;
		}

		if (content.length > maxLength) {
			setError(`Post content cannot exceed ${maxLength} characters`);
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/posts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to create post");
			}

			router.push("/");
			router.refresh();
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
		<div className="container py-6 max-w-2xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle>Create Post</CardTitle>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<div className="space-y-2">
							<Textarea
								placeholder="What's on your mind?"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								rows={5}
								className="resize-none"
							/>
							<div className="flex justify-end text-xs text-muted-foreground">
								<span
									className={
										content.length > maxLength ? "text-destructive" : ""
									}
								>
									{content.length}/{maxLength}
								</span>
							</div>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end space-x-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								isLoading || !content.trim() || content.length > maxLength
							}
						>
							{isLoading ? "Posting..." : "Post"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
