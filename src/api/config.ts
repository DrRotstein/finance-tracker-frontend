/**
 * Shared API configuration.
 * VITE_API_URL is a build-time variable — set it before `vite build`.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
