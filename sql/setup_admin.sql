-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create policy for admin users to read all data
CREATE POLICY "Admin users can view all profiles" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Create policy for admin users to update all data
CREATE POLICY "Admin users can update all profiles" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Create policy for inserting new users (usually done via trigger)
CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Function to create user profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin user profile (you need to create the auth user first via Supabase dashboard or auth API)
-- This assumes the auth user has already been created with email admin@gmail.com
-- If not, you'll need to create it via Supabase Auth API or dashboard first

-- Note: Replace 'ADMIN_USER_ID_HERE' with the actual UUID of the admin user from auth.users table
-- You can get this ID after creating the user in Supabase Auth

-- Example insert (replace the UUID with actual admin user ID):
-- INSERT INTO public.users (id, email, name, role) 
-- VALUES (
--     'ADMIN_USER_ID_HERE',
--     'admin@gmail.com',
--     'Administrator',
--     'super_admin'
-- ) ON CONFLICT (id) DO UPDATE SET 
--     role = 'super_admin',
--     name = 'Administrator',
--     updated_at = TIMEZONE('utc'::text, NOW()); 