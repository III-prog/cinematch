"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Film } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { useAuth } from "@/src/context/AuthContext";

type Recommendation = {
	id: number;
	title: string;
	overview: string;
	poster_path?: string | null;
	posterUrl?: string | null;
	rating?: number | null;
	year?: number | string | null;
	genres?: string[];
};

const RecommendationsPage = () => {
	const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
	const router = useRouter();

	const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const [likedMovies, setLikedMovies] = useState<Set<number>>(new Set());

	// Check auth then fetch recommendations
	useEffect(() => {
		const run = async () => {
			if (isAuthLoading) return;
			if (!isAuthenticated) {
				router.push("/login");
				setIsCheckingAuth(false);
				return;
			}

			setIsCheckingAuth(false);
			setLoading(page === 1);
			setLoadingMore(page > 1);
			setError(null);
			try {
				const res = await fetch(`/api/recommendations?page=${page}`, { credentials: "include" });
				if (!res.ok) {
					throw new Error("Failed to load recommendations");
				}

				const data = await res.json();
				const items: Recommendation[] = Array.isArray(data?.results) ? data.results : [];
				const incomingTotalPages =
					typeof data?.total_pages === "number" && data.total_pages > 0 ? data.total_pages : 1;

				setTotalPages(incomingTotalPages);
				setRecommendations((prev) => (page === 1 ? items : [...prev, ...items]));
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unable to load recommendations");
				if (page === 1) {
					setRecommendations([]);
					setTotalPages(1);
				}
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		};

		run();
	}, [isAuthenticated, isAuthLoading, router, page, refreshKey]);
	const handleLike = (movieId: number) => {
		console.log("entered handleLike");
		setLikedMovies((prev) => {
			const newLikes = new Set(prev);
			if (newLikes.has(movieId)) {
				newLikes.delete(movieId);
			} else {
				newLikes.add(movieId);
			}
			return newLikes;
		});
	};
	const handlePageChange = () => {
		console.log("likedMovies.size", likedMovies.size);
		if (likedMovies.size) {
			setPage(1);
			setRefreshKey((prev) => prev + 1);
			setLikedMovies(new Set());
		} else {
			setPage((prev) => prev + 1);
		}
	};
	if (!isAuthenticated && !isAuthLoading) {
		return null; // redirecting
	}

	if (loading || isAuthLoading || isCheckingAuth) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					<p className="text-sm text-gray-600 dark:text-gray-400">Loading your recommendations...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<div className="mb-2 flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recommended for you</h1>
							<Sparkles className="h-6 w-6 text-amber-400" />
						</div>
						<button
							type="button"
							onClick={() => {
								setPage(1);
								setRefreshKey((k) => k + 1);
							}}
							title="Like some movies and click refresh to get new recommendations"
							className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:border-gray-900 hover:bg-gray-900 hover:text-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-white dark:hover:text-gray-900"
						>
							{loading && page === 1 ? "Refreshing..." : "Refresh"}
						</button>
					</div>
				</motion.div>

				{error && (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
						{error}
					</div>
				)}

				{recommendations.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 dark:border-gray-700 dark:bg-gray-900"
					>
						<div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
							<Film className="h-12 w-12 text-gray-400" />
						</div>
						<h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
							No recommendations yet
						</h2>
						<p className="mb-6 max-w-sm text-center text-gray-600 dark:text-gray-400">
							Like or wishlist some movies and check back for personalized picks.
						</p>
						<button
							onClick={() => router.push("/")}
							className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
						>
							Discover Movies
						</button>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
						className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
					>
						{recommendations.map((movie, index) => (
							<MovieCard
								key={movie.id}
								id={movie.id}
								title={movie.title}
								overview={movie.overview}
								posterUrl={movie.posterUrl ?? movie.poster_path}
								index={index}
								onLike={handleLike}
							/>
						))}
					</motion.div>
				)}

				{/* Pagination */}
				{recommendations.length > 0 && (
					<div className="mt-6 flex items-center justify-end gap-3">
						<span className="text-xs text-gray-500 dark:text-gray-400">
							Page {page} of {totalPages}
						</span>
						{page < totalPages && (
							<button
								type="button"
								disabled={loadingMore}
								onClick={handlePageChange}
								className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition ${
									likedMovies.size > 0
										? "bg-blue-500 text-white hover:bg-blue-600"
										: "bg-gray-900 text-white hover:bg-gray-800"
								} disabled:cursor-not-allowed disabled:bg-gray-500`}
							>
								{loadingMore ? "Loading..." : likedMovies.size > 0 ? "Refresh Recommendations" : "Next"}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default RecommendationsPage;
