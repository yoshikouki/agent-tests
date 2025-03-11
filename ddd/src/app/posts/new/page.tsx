"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const formSchema = z.object({
	content: z
		.string()
		.min(1, { message: "Post content can't be empty" })
		.max(500, { message: "Post content can't exceed 500 characters" }),
});

export default function NewPostPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			const response = await fetch("/api/posts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.message || "Failed to create post");
				return;
			}

			toast.success("Post created successfully");
			router.push("/feed");
		} catch (error) {
			toast.error("An error occurred while creating the post");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="container max-w-4xl py-6">
			<h1 className="mb-6 text-3xl font-bold">Create Post</h1>

			<Card>
				<CardHeader>
					<CardTitle>New Post</CardTitle>
					<CardDescription>
						Share what's on your mind with your followers.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Content</FormLabel>
										<FormControl>
											<Textarea
												placeholder="What's on your mind?"
												className="min-h-32 resize-none"
												{...field}
											/>
										</FormControl>
										<div className="flex justify-end">
											<span
												className={`text-sm ${
													field.value.length > 500
														? "text-red-500"
														: "text-gray-500"
												}`}
											>
												{field.value.length}/500
											</span>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									disabled={isLoading}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Creating..." : "Post"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
