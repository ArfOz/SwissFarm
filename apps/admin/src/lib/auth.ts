/**
 * Decode JWT token and return its payload.
 * Uses a simple base64 decode (no signature verification needed on client).
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if the token is expired.
 * Returns true if token is missing, invalid, or expired.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded) return true;

  const exp = decoded.exp as number | undefined;
  if (!exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= exp * 1000;
}