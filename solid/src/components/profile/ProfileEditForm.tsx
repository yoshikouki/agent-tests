import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProfileWithUser } from "@/lib/profile";

interface ProfileEditFormProps {
	profile: ProfileWithUser;
	onCancel: () => void;
	onSuccess: () => void;
}

export default function ProfileEditForm({
	profile,
	onCancel,
	onSuccess,
}: ProfileEditFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState({
		username: profile.username,
		name: profile.name || "",
		bio: profile.bio || "",
		avatarUrl: profile.avatarUrl || "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const response = await fetch(`/api/profile`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to update profile");
			}

			router.refresh();
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-3xl mx-auto">
			<CardHeader>
				<h2 className="text-2xl font-bold text-center">Edit Profile</h2>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					{error && (
						<div className="bg-destructive/20 text-destructive p-3 rounded-md text-sm">
							{error}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Display Name</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea
							id="bio"
							name="bio"
							value={formData.bio}
							onChange={handleChange}
							rows={4}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="avatarUrl">Avatar URL</Label>
						<Input
							id="avatarUrl"
							name="avatarUrl"
							value={formData.avatarUrl}
							onChange={handleChange}
							placeholder="https://example.com/your-avatar.jpg"
						/>
					</div>
				</CardContent>

				<CardFooter className="flex justify-center gap-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
