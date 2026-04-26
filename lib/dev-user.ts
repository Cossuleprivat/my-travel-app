// AUTH BYPASS (Session 02): hardcoded dev user.
// Session 05 will replace this with the authenticated user's id from
// the Supabase session.
export const DEV_USER_ID = process.env.DEV_USER_ID!;

if (!DEV_USER_ID) {
  // Fail loud at import time if the env var is missing — there is no
  // graceful fallback because every visit needs a user_id.
  throw new Error(
    'DEV_USER_ID is not set in .env.local. See plan Pre-Flight Checklist.',
  );
}
