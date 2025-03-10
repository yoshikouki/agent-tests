import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="container flex flex-col items-center py-24 md:py-32">
			<div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
				<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					Connect with friends and the world
				</h1>
				<p className="mt-6 max-w-[42rem] text-lg text-muted-foreground">
					Join our social media platform to share your thoughts, connect with
					friends, and discover content from people around the world.
				</p>
				<div className="mt-8 flex flex-wrap justify-center gap-4">
					<Button size="lg" asChild>
						<Link href="/signup">Get Started</Link>
					</Button>
					<Button size="lg" variant="outline" asChild>
						<Link href="/signin">Sign In</Link>
					</Button>
				</div>
			</div>

			<div className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
				<div className="flex flex-col items-center text-center">
					<div className="mb-4 rounded-full bg-primary/10 p-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6 text-primary"
						>
							<path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2" />
							<rect width="18" height="18" x="3" y="4" rx="2" />
							<circle cx="12" cy="10" r="2" />
							<line x1="8" x2="8" y1="2" y2="4" />
							<line x1="16" x2="16" y1="2" y2="4" />
						</svg>
					</div>
					<h3 className="text-xl font-bold">User Profiles</h3>
					<p className="mt-2 text-muted-foreground">
						Create and customize your profile to showcase who you are.
					</p>
				</div>
				<div className="flex flex-col items-center text-center">
					<div className="mb-4 rounded-full bg-primary/10 p-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6 text-primary"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
						</svg>
					</div>
					<h3 className="text-xl font-bold">Share Posts</h3>
					<p className="mt-2 text-muted-foreground">
						Share your thoughts, photos, and experiences with your friends.
					</p>
				</div>
				<div className="flex flex-col items-center text-center">
					<div className="mb-4 rounded-full bg-primary/10 p-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6 text-primary"
						>
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
					</div>
					<h3 className="text-xl font-bold">Connect with Others</h3>
					<p className="mt-2 text-muted-foreground">
						Follow friends and discover new people with similar interests.
					</p>
				</div>
			</div>
		</div>
	);
}
