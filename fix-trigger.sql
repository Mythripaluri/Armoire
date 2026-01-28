-- Quick fix: Check if trigger exists and recreate if necessary
-- Run this in Supabase SQL Editor

-- First, let's see what tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if the trigger function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- Check if the trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND trigger_name = 'on_auth_user_created';

-- If the trigger doesn't exist, recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Add some logging
  RAISE LOG 'Creating profile for user: %', NEW.id;
  
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();