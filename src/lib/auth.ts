import { cookies } from "next/headers";

// Server-only helper for checking auth based on the HttpOnly cookie.
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get?.("token");
  return Boolean(token?.value);
}


