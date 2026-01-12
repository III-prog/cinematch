"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, MessageSquare, Send } from "lucide-react";

interface FormData {
	name: string;
	email: string;
	message: string;
}

interface FormErrors {
	name?: string;
	email?: string;
	message?: string;
}

export default function ContactPage() {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		message: "",
	});

	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

	// HTML sanitization function
	const sanitizeHTML = (str: string): string => {
		return (
			str
				// Remove script tags and their content
				.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
				// Remove all HTML tags
				.replace(/<[^>]*>/g, "")
				// Remove potentially dangerous attributes
				.replace(/on\w+="[^"]*"/gi, "")
				.replace(/javascript:/gi, "")
				.replace(/vbscript:/gi, "")
				.replace(/data:/gi, "")
				// Convert special characters to HTML entities
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;")
				.replace(/\//g, "&#x2F;")
				// Trim whitespace
				.trim()
		);
	};

	// Email validation regex
	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Validate form fields
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "Name must be at least 2 characters";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!isValidEmail(formData.email.trim())) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.message.trim()) {
			newErrors.message = "Message is required";
		} else if (formData.message.trim().length < 10) {
			newErrors.message = "Message must be at least 10 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for this field when user starts typing
		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}));
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setSubmitStatus("idle");

		try {
			// Sanitize form data before submission
			const sanitizedData = {
				name: sanitizeHTML(formData.name.trim()),
				email: sanitizeHTML(formData.email.trim()),
				message: sanitizeHTML(formData.message.trim()),
			};

			// Send to backend API
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(sanitizedData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to send message");
			}

			console.log("Contact form submitted:", sanitizedData);
			setSubmitStatus("success");

			// Reset form
			setFormData({
				name: "",
				email: "",
				message: "",
			});
			setErrors({});
		} catch (error) {
			console.error("Error submitting contact form:", error);
			setSubmitStatus("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-12"
				>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Have questions or feedback? We'd love to hear from you.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
				>
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Name Field */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								<div className="flex items-center gap-2">
									<User className="w-4 h-4" />
									Name
								</div>
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 ${
									errors.name
										? "border-red-500"
										: "border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
								}`}
								placeholder="Your full name"
								disabled={isSubmitting}
							/>
							{errors.name && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
							)}
						</div>

						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								<div className="flex items-center gap-2">
									<Mail className="w-4 h-4" />
									Email
								</div>
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 ${
									errors.email
										? "border-red-500"
										: "border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
								}`}
								placeholder="your.email@example.com"
								disabled={isSubmitting}
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
							)}
						</div>

						{/* Message Field */}
						<div>
							<label
								htmlFor="message"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								<div className="flex items-center gap-2">
									<MessageSquare className="w-4 h-4" />
									Message
								</div>
							</label>
							<textarea
								id="message"
								name="message"
								value={formData.message}
								onChange={handleInputChange}
								rows={6}
								className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 resize-none ${
									errors.message
										? "border-red-500"
										: "border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
								}`}
								placeholder="Tell us what's on your mind..."
								disabled={isSubmitting}
							/>
							{errors.message && (
								<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
							)}
						</div>

						{/* Submit Button */}
						<div className="pt-4">
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										Sending...
									</>
								) : (
									<>
										<Send className="w-4 h-4" />
										Send Message
									</>
								)}
							</button>
						</div>

						{/* Status Messages */}
						{submitStatus === "success" && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
							>
								<p className="text-green-800 dark:text-green-200 text-center">
									Thank you for your message! We'll get back to you soon.
								</p>
							</motion.div>
						)}

						{submitStatus === "error" && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
							>
								<p className="text-red-800 dark:text-red-200 text-center">
									Something went wrong. Please try again later.
								</p>
							</motion.div>
						)}
					</form>
				</motion.div>
			</div>
		</div>
	);
}
