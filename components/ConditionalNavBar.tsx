"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

type ConditionalNavBarProps = {
	authed: boolean;
};

export default function ConditionalNavBar({ authed }: ConditionalNavBarProps) {
	const pathname = usePathname();
	const hideNavbar = pathname === "/login" || pathname === "/signup";

	if (hideNavbar) {
		return null;
	}

	return <NavBar authed={authed} />;
}

