# Supabase Configuration and Usage Guide

## Overview

This document explains how to use the Supabase configuration that has been set up for the Hokistore application. The configuration includes authentication, database operations, and file storage capabilities.

## Configuration

### Environment Variables

Create a `.env.local` file in your root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxedaynwrzqojlrpqzdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZWRheW53cnpxb2pscnBxemR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NDU0MTksImV4cCI6MjA2NDMyMTQxOX0.xyz6BJFSdW-9QvCe1jpjtGPlMzc8DbhboD9JwYXC5kQ

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Schema

You need to create these tables in your Supabase database:

#### 1. Profiles Table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

#### 2. Orders Table (Optional)

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Usage Examples

### 1. Authentication Context

The `AuthContext` provides authentication functionality throughout the app:

```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>Welcome, {profile?.full_name || user.email}!</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### 2. Using the useSupabase Hook

For generic database operations:

```tsx
import { useSupabase } from '@/hooks/useSupabase';

function ProductsPage() {
  const { db, loading, error } = useSupabase();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await db.select('products', '*', { in_stock: true });
      if (data) {
        setProducts(data);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### 3. Using Service Functions

For specific application operations:

```tsx
import { profileService } from '@/services/supabaseService';

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data, error } = await profileService.getProfile(user.id);
    if (data) {
      setProfile(data);
    }
  };

  const updateProfile = async (updates) => {
    const { data, error } = await profileService.updateProfile(user.id, updates);
    if (data) {
      setProfile(data);
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      {/* Profile form here */}
    </div>
  );
}
```

### 4. File Upload Example

```tsx
import { storageService } from '@/services/supabaseService';

function FileUpload() {
  const handleFileUpload = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await storageService.uploadFile(
      'avatars', 
      fileName, 
      file
    );

    if (data) {
      const publicUrl = storageService.getPublicUrl('avatars', fileName);
      console.log('File uploaded:', publicUrl);
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      }} 
    />
  );
}
```

## Features Available

### Authentication
- ✅ Email/Password registration and login
- ✅ Google OAuth integration
- ✅ User profile management
- ✅ Session persistence
- ✅ Auto profile creation on registration

### Database Operations
- ✅ Generic CRUD operations
- ✅ Typed database client
- ✅ Service functions for common operations
- ✅ Error handling
- ✅ Loading states

### File Storage
- ✅ File upload to Supabase Storage
- ✅ Public URL generation
- ✅ File deletion
- ✅ File listing

### Security
- ✅ Row Level Security (RLS) policies
- ✅ Secure client configuration
- ✅ PKCE authentication flow
- ✅ Session management

## Available Services

1. **profileService** - User profile CRUD operations
2. **ordersService** - Order management
3. **productsService** - Product data operations
4. **categoriesService** - Category management
5. **analyticsService** - Dashboard analytics
6. **storageService** - File storage operations
7. **supabaseHelpers** - Utility functions

## Error Handling

All services return consistent error objects:

```tsx
const { data, error } = await profileService.getProfile(userId);

if (error) {
  console.error('Error:', error.message);
  // Handle error appropriately
  return;
}

// Use data safely
console.log('Profile:', data);
```

## Best Practices

1. **Always check for errors** before using data
2. **Use the AuthContext** for authentication state
3. **Use services** for specific operations rather than direct Supabase calls
4. **Implement loading states** for better UX
5. **Use TypeScript** for better type safety
6. **Handle offline scenarios** gracefully

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check environment variables
2. **Database permissions**: Ensure RLS policies are correct
3. **CORS errors**: Verify Supabase project settings
4. **Profile not created**: Check auth state change handling

### Debugging

Enable Supabase client debugging:

```tsx
// In development, you can log all Supabase operations
if (process.env.NODE_ENV === 'development') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
  });
}
```

## Next Steps

1. Set up the required database tables
2. Configure RLS policies
3. Set up storage buckets if needed
4. Implement additional features as needed
5. Add monitoring and analytics

For more information, refer to the [Supabase Documentation](https://supabase.com/docs). 