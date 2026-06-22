// Stateless double opt-in tokens — an HMAC-signed { email, expiry } payload.
// No database needed: the signature proves the link came from us and the
// expiry caps its lifetime. Uses Web Crypto so it runs on any Vercel runtime.

const encoder = new TextEncoder();
const TTL_MS = 24 * 60 * 60 * 1000; // confirmation links last 24 hours

function base64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(payload: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return new Uint8Array(sig);
}

export async function createSubscribeToken(email: string, secret: string): Promise<string> {
  const payload = base64url(
    encoder.encode(JSON.stringify({ e: email.toLowerCase(), x: Date.now() + TTL_MS })),
  );
  const sig = base64url(await hmac(payload, secret));
  return `${payload}.${sig}`;
}

/** Returns the verified email, or null if the token is malformed, tampered, or expired. */
export async function verifySubscribeToken(token: string, secret: string): Promise<string | null> {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = base64url(await hmac(payload, secret));
  // Constant-time-ish comparison to avoid signature timing leaks.
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as {
      e?: string;
      x?: number;
    };
    if (!data.e || !data.x || Date.now() > data.x) return null;
    return data.e;
  } catch {
    return null;
  }
}
