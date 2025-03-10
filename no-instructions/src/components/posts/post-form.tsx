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
import { Post } from "@/lib/models/post";

// Form schema
const formSchema = z.object({
	content: z
		.string()
		.min(1, "Post content cannot be empty")
		.max(500, "Post content is too long (max 500 characters)"),
});

type FormValues = z.infer<typeof formSchema>;

interface PostFormProps {
	initialData?: Post;
	onSubmit: (values: FormValues) => Promise<void>;
	isEditing?: boolean;
}

export function PostForm({
	initialData,
	onSubmit,
	isEditing = false,
}: PostFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: initialData?.content || "",
		},
	});

	const handleSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		try {
			await onSubmit(values);
			if (!isEditing) {
				form.reset();
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="What's on your mind?"
									className="min-h-[100px] resize-none"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting
							? isEditing
								? "Saving..."
								: "Posting..."
							: isEditing
								? "Save Changes"
								: "Post"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
