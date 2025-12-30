// src/context/WishlistContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface MovieDetails {
	movieId: number;
	title: string;
	posterUrl: string;
	overview: string;
	rating?: number | null;
	year?: number | string | null;
	genres?: string[];
	posterPath?: string | null;
}

interface WishlistContextType {
	wishlistIds: number[];
	isInWishlist: (movieId: number) => boolean;
	addToWishlist: (movie: MovieDetails) => Promise<void>;
	removeFromWishlist: (movieId: number) => Promise<void>;
	toggleWishlist: (movie: MovieDetails) => Promise<void>;
	loading: boolean;
	refetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [wishlistIds, setWishlistIds] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const { isAuthenticated } = useAuth();

	// Fetch wishlist ids from backend (lightweight for membership / pagination)
	const fetchWishlistIds = useCallback(async () => {
		if (!isAuthenticated) {
			setWishlistIds([]);
			return;
		}

		try {
			const response = await fetch("/api/wishlist?ids=1");
			const responseData = await response.json();

			if (response.ok) {
				setWishlistIds(responseData?.wishlistIds || []);
			}
		} catch (error) {
			console.error("Failed to fetch wishlist ids:", error);
		}
	}, [isAuthenticated]);

	// Load ids on mount and auth change
	useEffect(() => {
		fetchWishlistIds();
	}, [fetchWishlistIds]);

	// Check if movie is in wishlist
	const isInWishlist = useCallback(
		(movieId: number) => {
			return wishlistIds.includes(movieId);
		},
		[wishlistIds]
	);

	// Add movie to wishlist
	const addToWishlist = useCallback(
		async (movie: MovieDetails) => {
			if (!isAuthenticated) {
				throw new Error("Please login to add movies to your wishlist");
			}

			try {
				const response = await fetch("/api/wishlist", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(movie),
				});

				if (response.ok) {
					setWishlistIds((prev) => (prev.includes(movie.movieId) ? prev : [...prev, movie.movieId]));
				} else {
					const data = await response.json();
					throw new Error(data.error || "Failed to add to wishlist");
				}
			} catch (error) {
				console.error("Add to wishlist error:", error);
				throw error;
			}
		},
		[isAuthenticated]
	);

	// Remove movie from wishlist
	const removeFromWishlist = useCallback(
		async (movieId: number) => {
			if (!isAuthenticated) {
				throw new Error("Please login to manage your wishlist");
			}

			try {
				const response = await fetch("/api/wishlist", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ movieId }),
				});

				if (response.ok) {
					setWishlistIds((prev) => prev.filter((id) => id !== movieId));
				} else {
					const data = await response.json();
					throw new Error(data.error || "Failed to remove from wishlist");
				}
			} catch (error) {
				console.error("Remove from wishlist error:", error);
				throw error;
			}
		},
		[isAuthenticated]
	);

	// Toggle wishlist (add or remove)
	const toggleWishlist = useCallback(
		async (movie: MovieDetails) => {
			if (isInWishlist(movie.movieId)) {
				await removeFromWishlist(movie.movieId);
			} else {
				await addToWishlist(movie);
			}
		},
		[isInWishlist, addToWishlist, removeFromWishlist]
	);

	const refetchWishlist = useCallback(async () => {
		await fetchWishlistIds();
	}, [fetchWishlistIds]);

	return (
		<WishlistContext.Provider
			value={{
				wishlistIds,
				isInWishlist,
				addToWishlist,
				removeFromWishlist,
				toggleWishlist,
				loading,
				refetchWishlist,
			}}
		>
			{children}
		</WishlistContext.Provider>
	);
};

export const useWishlist = () => {
	const context = useContext(WishlistContext);
	if (context === undefined) {
		throw new Error("useWishlist must be used within a WishlistProvider");
	}
	return context;
};
