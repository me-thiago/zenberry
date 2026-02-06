/**
 * Turnstile Server-Side Validation
 * Validates Cloudflare Turnstile tokens
 */

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Skip verification in development if no key configured
  if (!secretKey) {
    console.warn("Turnstile: No secret key configured, skipping server verification");
    return true;
  }

  // Development mode token bypass
  if (token === "dev-mode-token") {
    return true;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data: TurnstileVerifyResponse = await response.json();
    return data.success;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    // Fail open in case of network issues (better UX, still have rate limit)
    return true;
  }
}
