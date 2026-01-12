"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Heart, Film, Trash2 } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { useAuth } from "@/src/context/AuthContext";
import { useLike } from "@/src/context/LikeContext";

type LikedMovie = {
	id?: number;
	movieId: number;
	title: string;
	overview: string;
	posterUrl?: string | null;
	poster_path?: string | null;
	posterPath?: string | null;
	rating?: number | null;
	year?: number | string | null;
	genres?: string[];
};

const LikedMoviesPage = () => {
	const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
	const { refetchLikes } = useLike();
	const router = useRouter();

	const [likedMovies, setLikedMovies] = useState<LikedMovie[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isDeletingAll, setIsDeletingAll] = useState(false);

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
				const res = await fetch(`/api/likedMovies?page=${page}`, { credentials: "include" });
				if (!res.ok) {
					throw new Error("Failed to load liked movies");
				}

				const data = await res.json();

				// Support both paginated shape and legacy array shape
				const items: LikedMovie[] = Array.isArray(data?.results) ? data.results : [];

				const incomingTotalPages =
					typeof data?.total_pages === "number" && data.total_pages > 0 ? data.total_pages : 1;

				setTotalPages(incomingTotalPages);
				setLikedMovies((prev) => (page === 1 ? items : [...prev, ...items]));
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unable to load liked movies");
				if (page === 1) {
					setLikedMovies([]);
					setTotalPages(1);
				}
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		};

		run();
	}, [isAuthenticated, isAuthLoading, router, page]);

	const handleDeleteAll = async () => {
		if (!confirm("Are you sure you want to delete all liked movies? This action cannot be undone.")) {
			return;
		}

		setIsDeletingAll(true);
		setError(null);

		try {
			const response = await fetch("/api/likedMovies?deleteAll=true", {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to delete all liked movies");
			}

			// Reset local state
			setLikedMovies([]);
			setPage(1);
			setTotalPages(1);

			// Refetch likes to ensure context is in sync
			await refetchLikes();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to delete all liked movies");
		} finally {
			setIsDeletingAll(false);
		}
	};

	if (!isAuthenticated && !isAuthLoading) {
		return null; // redirecting
	}

	if ((loading && page === 1) || isAuthLoading || isCheckingAuth) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
					<p className="text-sm text-gray-600 dark:text-gray-400">Loading your liked movies...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Liked Movies</h1>
							<Heart className="h-6 w-6 text-red-500" />
						</div>
						{likedMovies.length > 0 && (
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								disabled={isDeletingAll}
								onClick={handleDeleteAll}
								className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
							>
								{isDeletingAll ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Deleting...
									</>
								) : (
									<>
										<Trash2 className="h-4 w-4" />
										Delete All
									</>
								)}
							</motion.button>
						)}
					</div>
					<p className="text-gray-600 dark:text-gray-400">
						{likedMovies.length === 0
							? "Start liking movies to see them here."
							: `${likedMovies.length} ${likedMovies.length === 1 ? "movie" : "movies"} liked`}
					</p>
				</motion.div>

				{/* Error */}
				{error && (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
						{error}
					</div>
				)}

				{/* Empty State */}
				{likedMovies.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 dark:border-gray-700 dark:bg-gray-900"
					>
						<div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
							<Film className="h-12 w-12 text-gray-400" />
						</div>
						<h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
							You haven't liked any movies yet
						</h2>
						<p className="mb-6 max-w-sm text-center text-gray-600 dark:text-gray-400">
							Browse movies and tap the heart icon to like them. Your favorites will show up here.
						</p>
						<button
							onClick={() => router.push("/")}
							className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
						>
							Discover Movies
						</button>
					</motion.div>
				) : (
					<>
						{/* Movie Grid */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1 }}
							className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
						>
							{likedMovies.map((movie, index) => (
								<MovieCard
									key={movie.id ?? movie.movieId ?? `${movie.title}-${index}`}
									id={movie.movieId}
									title={movie.title}
									overview={movie.overview}
									posterUrl={movie.poster_path ?? movie.posterPath ?? null}
									index={index}
								/>
							))}
						</motion.div>

						{/* Pagination */}
						<div className="mt-6 flex items-center justify-start sm:justify-end gap-3">
							<span className="text-xs text-gray-500 dark:text-gray-400">
								Page {page} of {totalPages}
							</span>
							{page < totalPages && (
								<button
									type="button"
									disabled={loadingMore}
									onClick={() => setPage((p) => p + 1)}
									className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
								>
									{loadingMore ? "Loading..." : "Next"}
								</button>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default LikedMoviesPage;
