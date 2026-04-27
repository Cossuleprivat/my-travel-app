// AUTH BYPASS (Session 02): hardcoded dev user.
// Session 05 will replace this with the authenticated user's id from
// the Supabase session.
const id = process.env.DEV_USER_ID;
if (!id) {
  throw new Error(
    'DEV_USER_ID is not set in .env.local. See plan Pre-Flight Checklist.',
  );
}
export const DEV_USER_ID: string = id;
