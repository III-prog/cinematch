import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/src/context/AuthContext";
import { isAuthenticated } from "@/src/lib/auth";
import ClientAuthInit from "@/components/ClientAuthInit";
import { WishlistProvider } from "@/src/context/WishlistContext";
import { LikeProvider } from "@/src/context/LikeContext";
import ConditionalNavBar from "@/components/ConditionalNavBar";
import ConditionalMain from "@/components/ConditionalMain";

export const metadata: Metadata = {
	title: "Movie Recommender",
	description: "Minimal Next.js movie recommender frontend",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Server-side check for initial render; client will revalidate via AuthProvider.
	const authed = await isAuthenticated();

	return (
		<html lang="en">
			<body className="min-h-screen bg-background text-foreground antialiased">
				<AuthProvider>
					<ClientAuthInit />
					<WishlistProvider>
						<LikeProvider>
							<div className="relative flex min-h-screen flex-col">
								<ConditionalNavBar authed={authed} />
								<main className="flex-1">
									<ConditionalMain>{children}</ConditionalMain>
								</main>
							</div>
						</LikeProvider>
					</WishlistProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
