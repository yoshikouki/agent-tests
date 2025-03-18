import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FollowButtonProps {
	targetUserId: string;
	initialIsFollowing?: boolean;
}

export default function FollowButton({
	targetUserId,
	initialIsFollowing = false,
}: FollowButtonProps) {
	const router = useRouter();
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isLoading, setIsLoading] = useState(false);

	const toggleFollow = async () => {
		setIsLoading(true);

		try {
			const response = await fetch("/api/follow", {
				method: isFollowing ? "DELETE" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ targetUserId }),
			});

			if (response.ok) {
				setIsFollowing(!isFollowing);
				router.refresh();
			}
		} catch (error) {
			console.error("Error toggling follow status", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={toggleFollow}
			disabled={isLoading}
			variant={isFollowing ? "outline" : "default"}
			className="w-full"
		>
			{isLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
		</Button>
	);
}
