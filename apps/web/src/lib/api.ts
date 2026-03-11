/** Single source of truth for the backend base URL across the entire web app. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
