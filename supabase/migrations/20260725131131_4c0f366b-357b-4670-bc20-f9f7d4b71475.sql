ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles (lower(username)) WHERE username IS NOT NULL;

-- Allow everyone (including anon) to read leaderboard-relevant profile fields
GRANT SELECT ON public.profiles TO anon;

-- Public read policy for leaderboard (only exposes id, email, username, created_at which already exist)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow authenticated users to read scan counts for leaderboard aggregation
GRANT SELECT ON public.scan_history TO anon;
DROP POLICY IF EXISTS "Scan counts are viewable by everyone" ON public.scan_history;
CREATE POLICY "Scan counts are viewable by everyone"
  ON public.scan_history FOR SELECT
  USING (true);