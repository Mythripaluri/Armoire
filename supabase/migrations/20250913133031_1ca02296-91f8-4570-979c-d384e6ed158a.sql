-- Create profiles table for user preferences
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  style_preference TEXT DEFAULT 'casual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create wardrobe_items table
CREATE TABLE public.wardrobe_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tops', 'bottoms', 'shoes', 'accessories')),
  name TEXT NOT NULL,
  color TEXT,
  tags TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on wardrobe_items
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Create policies for wardrobe_items
CREATE POLICY "Users can view their own wardrobe items" 
ON public.wardrobe_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wardrobe items" 
ON public.wardrobe_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items" 
ON public.wardrobe_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items" 
ON public.wardrobe_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage bucket for wardrobe images
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe', 'wardrobe', true);

-- Create storage policies for wardrobe bucket
CREATE POLICY "Users can view their own wardrobe images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own wardrobe images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own wardrobe images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own wardrobe images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'wardrobe' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wardrobe_items_updated_at
  BEFORE UPDATE ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();