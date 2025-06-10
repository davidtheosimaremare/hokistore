"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Zap, Lock, User } from "lucide-react";
import Link from "next/link";
import { loginAdmin, setSession } from "@/lib/auth-simple";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", { email, password: "***" });
      const result = await loginAdmin(email, password);
      console.log("Login result:", result);
      
      if (result.success && result.user) {
        console.log('✅ Login successful, storing session for user:', result.user);
        // Store session
        setSession(result.user);
        console.log('💾 Session stored, redirecting to dashboard...');
        router.push("/admin/dashboard");
      } else {
        console.error("Login failed:", result.error);
        setError(result.error || "Login gagal");
      }
    } catch (error) {
      console.error("Login exception:", error);
      setError("Terjadi kesalahan saat login: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Hokiindo Raya Management System</p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-xl border-0">
          <div className="p-6 space-y-1 pb-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">
              Masuk ke Admin Panel
            </h2>
            <p className="text-center text-gray-600">
              Akses sistem pengelolaan Hokiindo Raya
            </p>
          </div>
          
          <div className="p-6 pt-0">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@hokiindo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 h-12 px-3 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 h-12 px-3 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Masuk Admin</span>
                  </div>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
              <p className="text-xs text-gray-600">Email: admin@hokiindo.com</p>
              <p className="text-xs text-gray-600">Password: admin123</p>
            </div>

            {/* Back to Website */}
            <div className="mt-6 text-center">
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Kembali ke Website</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Hokiindo Raya. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #ef4444 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
} 