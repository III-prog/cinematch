"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { MovieDetails } from "./WishlistContext";

interface LikeContextType {
	likedIds: number[];
	isLiked: (movieId: number) => boolean;
	addLike: (movie: MovieDetails) => Promise<void>;
	removeLike: (movieId: number) => Promise<void>;
	toggleLike: (movie: MovieDetails) => Promise<void>;
	loading: boolean;
	refetchLikes: () => Promise<void>;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

export const LikeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [likedIds, setLikedIds] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const { isAuthenticated } = useAuth();

	const fetchLikes = useCallback(async () => {
		if (!isAuthenticated) {
			setLikedIds([]);
			return;
		}

		try {
			setLoading(true);
			const response = await fetch("/api/likedMovies?ids=1");
			const responseData = await response.json();

			if (response.ok) {
				setLikedIds(responseData?.likedMovieIds || []);
			}
		} catch (error) {
			console.error("Failed to fetch likes:", error);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		fetchLikes();
	}, [fetchLikes]);

	const isLiked = useCallback(
		(movieId: number) => likedIds.includes(movieId),
		[likedIds]
	);

	const addLike = useCallback(
		async (movie: MovieDetails) => {
			if (!isAuthenticated) {
				throw new Error("Please login to like movies");
			}

			try {
				const response = await fetch("/api/likedMovies", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(movie),
				});

				if (response.ok) {
					setLikedIds((prev) => (prev.includes(movie.movieId) ? prev : [...prev, movie.movieId]));
				} else {
					const data = await response.json();
					throw new Error(data.error || "Failed to like movie");
				}
			} catch (error) {
				console.error("Add like error:", error);
				throw error;
			}
		},
		[isAuthenticated]
	);

	const removeLike = useCallback(
		async (movieId: number) => {
			if (!isAuthenticated) {
				throw new Error("Please login to manage likes");
			}

			try {
				const response = await fetch("/api/likedMovies", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ movieId }),
				});

				if (response.ok) {
					setLikedIds((prev) => prev.filter((id) => id !== movieId));
				} else {
					const data = await response.json();
					throw new Error(data.error || "Failed to remove like");
				}
			} catch (error) {
				console.error("Remove like error:", error);
				throw error;
			}
		},
		[isAuthenticated]
	);

	const toggleLike = useCallback(
		async (movie: MovieDetails) => {
			if (isLiked(movie.movieId)) {
				await removeLike(movie.movieId);
			} else {
				await addLike(movie);
			}
		},
		[isLiked, addLike, removeLike]
	);

	const refetchLikes = useCallback(async () => {
		await fetchLikes();
	}, [fetchLikes]);

	return (
		<LikeContext.Provider value={{ likedIds, isLiked, addLike, removeLike, toggleLike, loading, refetchLikes }}>
			{children}
		</LikeContext.Provider>
	);
};

export const useLike = () => {
	const context = useContext(LikeContext);
	if (context === undefined) {
		throw new Error("useLike must be used within a LikeProvider");
	}
	return context;
};

