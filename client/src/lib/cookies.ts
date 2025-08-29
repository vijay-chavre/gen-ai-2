// Function-based implementation for managing cookies in TypeScript

"use client";

interface CookieOptions {
  expires?: number | Date; // Expiration time in seconds or a Date object
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Set a cookie
 * @param name - The name of the cookie
 * @param value - The value of the cookie (string or object)
 * @param options - Additional options (e.g., { expires, path, domain, secure, sameSite })
 */
function setCookie(
  name: string,
  value: string | object,
  options: CookieOptions = {}
): void {
  const cookieValue = typeof value === "object" ? JSON.stringify(value) : value;
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(cookieValue)}`;

  // Default expiration time to 5 days if not provided
  if (!options.expires) {
    const date = new Date();
    date.setTime(date.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days in milliseconds
    options.expires = date;
  }

  if (options.expires) {
    if (typeof options.expires === "number") {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 1000);
      options.expires = date;
    }
    if (options.expires instanceof Date) {
      cookie += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.path) {
    cookie += `; path=${options.path}`;
  }

  if (options.domain) {
    cookie += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookie += "; secure";
  }

  if (options.sameSite) {
    cookie += "; samesite=" + options.sameSite;
  }

  document.cookie = cookie;
}

/**
 * Get a cookie
 * @param name - The name of the cookie
 * @returns The value of the cookie (parsed as JSON if possible) or null if not found
 */
function getCookie<T = string | object>(name: string): T | null {
  if (typeof document !== "undefined") {
    const cookies = document?.cookie
      .split("; ")
      ?.reduce<Record<string, string>>((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[decodeURIComponent(key)] = decodeURIComponent(value);
        return acc;
      }, {});
    if (cookies[name]) {
      try {
        return JSON.parse(cookies[name]) as T;
      } catch {
        return cookies[name] as T;
      }
    }
  }
  return null;
}

/**
 * Delete a cookie
 * @param name - The name of the cookie
 * @param options - Options to match when deleting (e.g., { path, domain })
 */
function deleteCookie(
  name: string,
  options: Omit<CookieOptions, "expires"> = {}
): void {
  console.log("Deleting cookie", name);
  setCookie(name, "", { ...options, expires: new Date(0), path: "/" });
}

/**
 * Check if a cookie exists
 * @param name - The name of the cookie
 * @returns True if the cookie exists, false otherwise
 */
function cookieExists(name: string): boolean {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${encodeURIComponent(name)}=`));
}

function setUserCookie(user: any) {
  setCookie("user", user, {
    expires: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
}

function getUserCookie() {
  return getCookie<any>("user");
}

function setAuthTokenCookie(token: string) {
  setCookie("auth_token", token, {
    expires: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
}

function getAuthTokenCookie() {
  return getCookie<string>("auth_token");
}

function setAccessTokenCookie(token: string) {
  setCookie("access_token", token, {
    expires: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
}
function getAccessTokenCookie() {
  return getCookie<string>("access_token");
}

function setRefreshTokenCookie(token: string) {
  setCookie("refresh_token", token, {
    expires: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
}
function getRefreshTokenCookie() {
  return getCookie<string>("refresh_token");
}

function logOut() {
  deleteCookie("user");
  deleteCookie("access_token");
  deleteCookie("refresh_token");
}

export {
  cookieExists,
  deleteCookie,
  getAccessTokenCookie,
  getAuthTokenCookie,
  getCookie,
  getRefreshTokenCookie,
  getUserCookie,
  logOut,
  setAccessTokenCookie,
  setAuthTokenCookie,
  setCookie,
  setRefreshTokenCookie,
  setUserCookie,
};
