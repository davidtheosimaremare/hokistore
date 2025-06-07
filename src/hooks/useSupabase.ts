"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthError, User } from '@supabase/supabase-js';

// Custom hook for common Supabase operations
export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = () => setError(null);

  // Get current user
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return !!user;
  };

  // Database operations
  const db = {
    // Generic select operation
    select: async <T = any>(
      table: string, 
      columns = '*', 
      filters?: Record<string, any>
    ): Promise<{ data: T[] | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from(table).select(columns);
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        const { data, error } = await query;
        
        if (error) {
          setError(error.message);
          return { data: null, error: error.message };
        }
        
        return { data: data as T[], error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Database operation failed';
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },

    // Generic insert operation
    insert: async <T = any>(
      table: string, 
      data: Record<string, any>
    ): Promise<{ data: T | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single();
        
        if (error) {
          setError(error.message);
          return { data: null, error: error.message };
        }
        
        return { data: result, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Insert operation failed';
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },

    // Generic update operation
    update: async <T = any>(
      table: string, 
      data: Record<string, any>, 
      filters: Record<string, any>
    ): Promise<{ data: T | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from(table).update(data);
        
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data: result, error } = await query.select().single();
        
        if (error) {
          setError(error.message);
          return { data: null, error: error.message };
        }
        
        return { data: result, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Update operation failed';
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },

    // Generic delete operation
    delete: async (
      table: string, 
      filters: Record<string, any>
    ): Promise<{ success: boolean; error: string | null }> => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from(table).delete();
        
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { error } = await query;
        
        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }
        
        return { success: true, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Delete operation failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
  };

  // Storage operations
  const storage = {
    // Upload file
    upload: async (
      bucket: string, 
      path: string, 
      file: File
    ): Promise<{ data: any | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file);
        
        if (error) {
          setError(error.message);
          return { data: null, error: error.message };
        }
        
        return { data, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },

    // Get public URL
    getPublicUrl: (bucket: string, path: string): string => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },

    // Download file
    download: async (
      bucket: string, 
      path: string
    ): Promise<{ data: Blob | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(path);
        
        if (error) {
          setError(error.message);
          return { data: null, error: error.message };
        }
        
        return { data, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Download failed';
        setError(errorMessage);
        return { data: null, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
  };

  return {
    loading,
    error,
    clearError,
    getCurrentUser,
    isAuthenticated,
    db,
    storage,
    // Direct access to supabase client if needed
    client: supabase,
  };
}; 