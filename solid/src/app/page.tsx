import { Timeline } from "@/components/timeline/timeline";

export default function Home() {
	return (
		<div className="container py-6 md:py-10 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Your Timeline</h1>
			<Timeline />
		</div>
	);
}
