"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Check if we have the necessary parameters for password reset
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      setMessage({ 
        type: 'error', 
        text: errorDescription || 'Link reset password tidak valid atau sudah kedaluwarsa.' 
      });
    }
  }, [searchParams]);

  const validatePasswords = () => {
    const newErrors: {[key: string]: string} = {};

    if (!password) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Password tidak sama";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Gagal memperbarui password' 
        });
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        setMessage({ 
          type: 'success', 
          text: `Password berhasil diperbarui! Anda akan dialihkan ke halaman login dalam ${countdown} detik.` 
        });
        
        // Start countdown
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            const newCount = prev - 1;
            setMessage({ 
              type: 'success', 
              text: `Password berhasil diperbarui! Anda akan dialihkan ke halaman login dalam ${newCount} detik.` 
            });
            
            if (newCount <= 0) {
              clearInterval(countdownInterval);
              setIsLoading(false);
              router.replace('/login');
            }
            
            return newCount;
          });
        }, 1000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Terjadi kesalahan saat memperbarui password' 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 animate-ken-burns"
        style={{
          backgroundImage: "url('/images/asset-web/baner-2.png')"
        }}
      ></div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75"></div>
      
      {/* Red overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F90020]/30 via-black/20 to-[#F90020]/40"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl p-3 border-2 border-[#F90020]/30">
              <img
                src="/images/asset-web/logo-fav.png"
                alt="Hokiindo Raya"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-2xl">
              <span className="text-[#F90020]">Hokiindo</span> Raya
            </h1>
            <p className="text-sm text-white/90 mt-1 drop-shadow-lg">
              Distributor Resmi SIEMENS
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-[#F90020]/20 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-600">
                Masukkan password baru Anda
              </p>
            </div>

            {/* Back to Login Link */}
            <div className="mb-4">
              <Link
                href="/login"
                className="inline-flex items-center text-[#F90020] hover:text-[#F90020]/80 text-sm font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Login
              </Link>
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-center p-4 rounded-xl mb-6 transition-all duration-300 ${
                message.type === 'error' 
                  ? 'bg-red-50 border-2 border-[#F90020]/30 text-[#F90020]' 
                  : 'bg-green-50 border-2 border-green-300 text-green-700'
              }`}>
                {message.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: "" }));
                      }
                    }}
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                      errors.password ? 'border-[#F90020] bg-red-50' : 'border-gray-200 hover:border-[#F90020]/30'
                    }`}
                    placeholder="Masukkan password baru"
                    autoFocus
                    disabled={isSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F90020] transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-[#F90020] flex items-center font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: "" }));
                      }
                    }}
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                      errors.confirmPassword ? 'border-[#F90020] bg-red-50' : 'border-gray-200 hover:border-[#F90020]/30'
                    }`}
                    placeholder="Konfirmasi password baru"
                    disabled={isSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F90020] transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-[#F90020] flex items-center font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full bg-[#F90020] hover:bg-[#F90020]/90 text-white py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border-2 border-[#F90020] hover:border-[#F90020]/90 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memperbarui Password...
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Berhasil! Mengalihkan...
                  </div>
                ) : (
                  'Perbarui Password'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-[#F90020] font-bold text-sm">Hokiindo Raya</span>
                <span className="text-xs text-gray-400">
                  Semua Hak Dilindungi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1.1) rotate(0deg);
          }
          50% {
            transform: scale(1.15) rotate(0.5deg);
          }
          100% {
            transform: scale(1.1) rotate(0deg);
          }
        }

        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 