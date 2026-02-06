"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const TOKEN_COOKIE_NAME = "shopify_customer_token";
const TOKEN_EXPIRES_COOKIE_NAME = "shopify_token_expires";

export interface SaveTokenParams {
  accessToken: string;
  expiresAt: string;
}

/**
 * Salva o token de autenticação em cookies httpOnly
 */
export async function saveAuthToken({ accessToken, expiresAt }: SaveTokenParams) {
  const cookieStore = await cookies();
  const expiresDate = new Date(expiresAt);

  cookieStore.set(TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresDate,
    path: "/",
  });

  cookieStore.set(TOKEN_EXPIRES_COOKIE_NAME, expiresAt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresDate,
    path: "/",
  });
}

/**
 * Recupera o token de autenticação dos cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME);
  const expires = cookieStore.get(TOKEN_EXPIRES_COOKIE_NAME);

  if (!token || !expires) {
    return null;
  }

  // Verificar se o token expirou
  const expiresDate = new Date(expires.value);
  if (expiresDate < new Date()) {
    await clearAuthToken();
    return null;
  }

  return token.value;
}

/**
 * Remove o token de autenticação dos cookies
 */
export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
  cookieStore.delete(TOKEN_EXPIRES_COOKIE_NAME);
}

/**
 * Faz logout e redireciona para login
 */
export async function logoutAndRedirect() {
  await clearAuthToken();
  redirect("/auth/login");
}
