import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
  getUserCookie,
  logOut,
  setAccessTokenCookie,
} from "@/lib/cookies";
import { errorHandler } from "@/utils/error/errorHandler";
import { ErrorResponse } from "@/utils/error/types";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import https from "https";
import {
  getServerCookie,
  getServerRefreshToken,
  getServerToken,
  serverLogout,
  setServerAccessToken,
} from "./helper";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const defaultHeaders = {
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Expires: "0",
  "Content-Type": "application/json",
};

export const defaultAxios = axios.create({
  baseURL: BASE_URL,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Allow self-signed SSL
});

//attachDeduplicationInterceptor(defaultAxios);

/**
 * Send an API request
 * @param url The request URL
 * @param data The request data
 * @param method The request method
 * @param headers The request headers
 * @param noHeaders Whether to omit the default headers
 * @param rest The rest of the AxiosRequestConfig
 * @returns The response data
 /**
 * Creates an axios request configuration
 */
const createRequestConfig = (
  method: AxiosRequestConfig["method"],
  url: string,
  token: string | null,
  headers: AxiosRequestConfig["headers"],
  noHeaders: boolean,
  data: Record<string, unknown>,
  rest: Partial<AxiosRequestConfig>
) => ({
  method,
  url,
  headers: {
    ...(noHeaders ? {} : defaultHeaders),
    ...headers,
    Authorization: token ? `Bearer ${token}` : undefined,
  },
  data,
  ...rest,
});

/**
 * Handles token refresh and retry logic
 */
const handleTokenRefresh = async (
  isServer: boolean,
  config: ReturnType<typeof createRequestConfig>
) => {
  const refreshToken = isServer
    ? await getServerRefreshToken()
    : getRefreshTokenCookie();

  const user = isServer ? await getServerCookie("user") : getUserCookie();

  if (!refreshToken) {
    isServer ? await serverLogout() : logOut();
    throw new Error("Unauthorized. Redirect to login.");
  }
  console.log("Refreshing token");

  try {
    const refreshResponse = await defaultAxios.post("/access-token", {
      token: refreshToken,
      email: user?.email,
      sub: user?.sub,
    });
    const newToken = refreshResponse?.data?.token;
    if (newToken) {
      isServer
        ? await setServerAccessToken(newToken)
        : setAccessTokenCookie(newToken);
    }
    if (newToken) {
      const response = await defaultAxios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
      return response;
    }
  } catch (error) {
    if (isServer) {
      throw new Error("Unauthorized. Redirect to login.");
    } else {
      logOut();
      window.location.href = "/login";
      throw new Error("Unauthorized. Redirect to login.");
    }
  }
};

/**
 * Send an API request
 */
export async function apiClient({
  url,
  data = {},
  method = "GET",
  headers = {
    "Access-Control-Allow-Origin": "*",
  },
  noHeaders = false,
  ...rest
}: {
  url: string;
  data?: Record<string, unknown>;
  method?: AxiosRequestConfig["method"];
  headers?: AxiosRequestConfig["headers"];
  noHeaders?: boolean;
} & Omit<AxiosRequestConfig, "url" | "method" | "data" | "headers">): Promise<
  AxiosResponse["data"] | null
> {
  const isServer = typeof window === "undefined";
  const token = isServer ? await getServerToken() : getAccessTokenCookie();
  try {
    console.log("url", method, url);
    const config = createRequestConfig(
      method,
      url,
      token,
      headers,
      noHeaders,
      data,
      rest
    );
    const res = await defaultAxios(config);
    return res;
  } catch (err: AxiosError | any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        const config = createRequestConfig(
          method,
          url,
          token,
          headers,
          noHeaders,
          data,
          rest
        );
        console.log("Token expired, refreshing...");
        return handleTokenRefresh(isServer, config);
      }

      if (!err.response) {
        throw errorHandler({
          status: "fail",
          statusCode: err.code || 400,
          errors: {
            message: "Internal Server Error",
          },
        } as ErrorResponse);
      }
      throw err;
    }
    throw err;
  }
}
