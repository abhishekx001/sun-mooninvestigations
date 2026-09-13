-- WARNING: This will completely wipe all users and authentication data!
-- Run this in the Supabase SQL Editor to clean up the corrupted state.

-- 1. Disable triggers temporarily to avoid constraint issues during cleanup
SET session_replication_role = 'replica';

-- 2. Wipe everything in reverse dependency order
DELETE FROM public.reports;
DELETE FROM public.case_progress;
DELETE FROM public.cases;
DELETE FROM public.profiles;
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.users;

-- 3. Re-enable triggers
SET session_replication_role = 'origin';

-- DONE.
-- Now DO NOT use SQL to insert users again!
-- Go directly to Authentication -> Users in the Supabase Dashboard and click "Add User" -> "Create New User".
