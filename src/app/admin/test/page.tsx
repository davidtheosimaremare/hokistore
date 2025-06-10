"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminTest() {
  const router = useRouter();

  useEffect(() => {
    console.log('🧪 Test page loaded');
    
    // Check localStorage
    const adminSession = localStorage.getItem('admin_session');
    console.log('🔍 Session in localStorage:', !!adminSession);
    
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        console.log('📊 Parsed session:', session);
      } catch (error) {
        console.error('❌ Error parsing session:', error);
      }
    }
  }, []);

  const testRedirect = () => {
    console.log('🚀 Testing redirect to dashboard...');
    router.push('/admin/dashboard');
  };

  const clearSession = () => {
    localStorage.removeItem('admin_session');
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('🧹 Session cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Test Page</h1>
        
        <div className="space-y-4">
          <button
            onClick={testRedirect}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Redirect to Dashboard
          </button>
          
          <button
            onClick={clearSession}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Session
          </button>
          
          <div className="space-y-2">
            <Link 
              href="/admin/login" 
              className="block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
            >
              Go to Login
            </Link>
            
            <Link 
              href="/admin/dashboard" 
              className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              Go to Dashboard (Link)
            </Link>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-white rounded border">
          <h2 className="font-semibold mb-2">Debug Info</h2>
          <p>Check browser console for detailed logs</p>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
        </div>
      </div>
    </div>
  );
} 