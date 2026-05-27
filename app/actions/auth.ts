"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 💡 Export the State interface here so the Client Component can import it
export interface AuthState {
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email");
  const password = formData.get("password");

  // Strict validation replacing unsafe 'as string' casts
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return { error: "Email and password are required." };
  }

  let isSuccess = false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store", // Prevents caching of sensitive auth endpoints
    });

    if (!res.ok) {
      return { error: "Invalid email or password" };
    }

    const data = await res.json();
    const token = data.access_token;

    // React 19 / Next 15: cookies() must be awaited
    const cookieStore = await cookies();

    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Mark for redirect outside the try...catch block
    isSuccess = true;

  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to connect to the authentication server." };
  }

  // 💡 CRITICAL: Next.js redirect throws an error internally. 
  // It must be executed outside the try...catch block.
  if (isSuccess) {
    redirect("/admin");
  }

  // Fallback state if execution somehow reaches here
  return {};
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");

  // Immediately eject the user to the login screen
  redirect("/admin/login");
}
