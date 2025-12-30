"use client";

import { usePathname } from "next/navigation";

type ConditionalMainProps = {
	children: React.ReactNode;
};

export default function ConditionalMain({ children }: ConditionalMainProps) {
	const pathname = usePathname();
	const isAuthPage = pathname === "/login" || pathname === "/signup";

	if (isAuthPage) {
		return <>{children}</>;
	}

	return <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>;
}

