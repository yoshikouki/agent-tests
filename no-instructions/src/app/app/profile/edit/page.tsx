"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Form schema
const profileFormSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	bio: z.string().max(300, "Bio must be less than 300 characters").optional(),
	imageUrl: z.string().url("Please enter a valid URL").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [userProfile, setUserProfile] = useState<ProfileFormValues | null>(
		null,
	);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			name: "",
			bio: "",
			imageUrl: "",
		},
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/signin");
			return;
		}

		if (status === "authenticated" && session.user && session.user.id) {
			fetchUserProfile(session.user.id);
		}
	}, [status, session, router]);

	const fetchUserProfile = async (userId: string) => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/users/${userId}`);

			if (!response.ok) {
				throw new Error("Failed to fetch user profile");
			}

			const data = await response.json();
			const profile = data.user;

			setUserProfile({
				name: profile.name,
				bio: profile.bio || "",
				imageUrl: profile.imageUrl || "",
			});

			form.reset({
				name: profile.name,
				bio: profile.bio || "",
				imageUrl: profile.imageUrl || "",
			});
		} catch (error) {
			console.error("Error fetching user profile:", error);
			toast.error("Failed to load profile information");
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (values: ProfileFormValues) => {
		if (!session?.user?.id) return;

		setIsSaving(true);

		try {
			const response = await fetch(`/api/users/${session.user.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Failed to update profile");
			}

			// Update the session to reflect changes
			await update({
				...session,
				user: {
					...session.user,
					name: values.name,
					image: values.imageUrl,
				},
			});

			toast.success("Profile updated successfully");
			router.push(`/app/profile/${session.user.id}`);
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error("Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	if (isLoading) {
		return (
			<div className="container max-w-xl py-8">
				<div className="space-y-6">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-xl py-8">
			<Card>
				<CardHeader>
					<CardTitle>Edit Profile</CardTitle>
					<CardDescription>
						Update your profile information visible to other users
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<div className="flex justify-center mb-6">
								<Avatar className="h-24 w-24">
									<AvatarImage
										src={form.watch("imageUrl") || ""}
										alt={form.watch("name")}
									/>
									<AvatarFallback className="text-lg">
										{form.watch("name") ? getInitials(form.watch("name")) : "?"}
									</AvatarFallback>
								</Avatar>
							</div>

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Your name" {...field} />
										</FormControl>
										<FormDescription>
											This is your public display name.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bio</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Tell us about yourself"
												className="resize-none min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Share a brief description about yourself.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="imageUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Profile Image URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://example.com/image.jpg"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Enter a URL to your profile picture.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSaving}>
									{isSaving ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
