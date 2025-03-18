"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

// Schema for comment validation
const commentSchema = z.object({
	content: z
		.string()
		.min(1, { message: "Comment cannot be empty" })
		.max(500, { message: "Comment cannot exceed 500 characters" }),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
	postId: string;
	onSuccess?: () => void;
}

export default function CommentForm({ postId, onSuccess }: CommentFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<CommentFormValues>({
		resolver: zodResolver(commentSchema),
		defaultValues: {
			content: "",
		},
	});

	async function onSubmit(data: CommentFormValues) {
		setIsSubmitting(true);

		try {
			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to post comment");
			}

			form.reset();
			toast.success("Comment posted successfully");

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to post comment",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="Add a comment..."
									className="resize-none"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end">
					<Button type="submit" size="sm" disabled={isSubmitting}>
						{isSubmitting ? "Posting..." : "Post Comment"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
