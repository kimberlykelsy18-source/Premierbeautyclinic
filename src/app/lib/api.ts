// Central API utility for all backend requests.
//
// WHY THIS FILE EXISTS:
// Instead of writing fetch('http://localhost:3000/...') in every component,
// we have one place that:
//  - Knows the backend URL (from .env)
//  - Attaches the JWT auth token to every request automatically
//  - Attaches the guest session ID for cart tracking
//  - Throws a proper Error if the server returns an error response
//
// Usage:
//   import { apiFetch } from '../lib/api';
//   const data = await apiFetch('/products');
//   const data = await apiFetch('/orders', { method: 'GET' }, token);

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Converts a sequential number into a short human-readable ID.
// Formula: every 999 entries the letter increments (A→B→C…)
// Examples: 1→A001, 999→A999, 1000→B001, 1998→B999, 1999→C001
function toShortId(prefix: string, n: number | null | undefined): string {
  if (!n) return `${prefix}-???`;
  const letterIndex = Math.floor((n - 1) / 999);
  const numPart     = ((n - 1) % 999) + 1;
  const letter      = String.fromCharCode(65 + letterIndex); // 0→A, 1→B …
  return `${prefix}-${letter}${String(numPart).padStart(3, '0')}`;
}

export const toShortOrderId   = (n: number | null | undefined) => toShortId('ORD', n);
export const toShortAptId    = (n: number | null | undefined) => toShortId('APT', n);
export const toShortWalkInId = (n: number | null | undefined) => toShortId('WLK', n);

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  sessionId?: string | null
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // If a JWT token is provided, attach it so the backend knows who is calling
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // If a guest session ID is provided, attach it for cart tracking
  if (sessionId) headers['x-session-id'] = sessionId;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  // If the server returned an error status, throw so the calling code
  // can catch it and show the user a meaningful message
  if (!res.ok) throw new Error(data.error || 'Request failed');

  return data;
}
