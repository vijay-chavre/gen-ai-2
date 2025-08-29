"use server";
import { cookies } from "next/headers";

export async function getServerToken() {
  const cookieStore = await cookies(); // No need to await
  return cookieStore.get("access_token")?.value || null;
}

export async function getServerRefreshToken() {
  const cookieStore = await cookies(); // No need to await
  return cookieStore.get("refresh_token")?.value || null;
}

export async function getServerCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
}

export async function setServerAccessToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", token);
}

export async function serverLogout() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    cookieStore.delete(cookie.name);
  }
}
