"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Check, Zap, Settings, Cpu, ArrowRight, ArrowLeft, Globe } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import PolicyModal from "@/components/PolicyModal";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import language files
import enLang from "@/lang/en";
import idLang from "@/lang/id";

// Types
interface LanguageContextType {
  language: string;
  translations: any;
  changeLanguage: (lang: string) => void;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Language Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Provider Component
const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('id');
  const [translations, setTranslations] = useState(idLang);

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'en' || savedLang === 'id')) {
      setLanguage(savedLang);
      setTranslations(savedLang === 'en' ? enLang : idLang);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    setTranslations(lang === 'en' ? enLang : idLang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, translations, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Language Switcher Component
const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
      <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
        <button
          onClick={() => changeLanguage('id')}
          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
            language === 'id'
              ? 'bg-[#F90020] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#F90020]'
          }`}
        >
          ID
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
            language === 'en'
              ? 'bg-[#F90020] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#F90020]'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};

function RegisterPageContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { translations: t } = useLanguage();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1); // 1 = name, 2 = email, 3 = password
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Policy modal state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Registrasi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(t.auth.googleLoginError);
      }
    } catch (error) {
      setError(t.auth.googleLoginErrorGeneral);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    const labels = {
      id: ["", "Lemah", "Cukup", "Baik", "Kuat", "Sangat Kuat"],
      en: ["", "Weak", "Fair", "Good", "Strong", "Very Strong"]
    };
    
    const currentLang = t === idLang ? 'id' : 'en';
    
    if (score <= 1) return { strength: score, label: labels[currentLang][1], color: "bg-red-500" };
    if (score <= 2) return { strength: score, label: labels[currentLang][2], color: "bg-yellow-500" };
    if (score <= 3) return { strength: score, label: labels[currentLang][3], color: "bg-blue-500" };
    if (score <= 4) return { strength: score, label: labels[currentLang][4], color: "bg-green-500" };
    return { strength: score, label: labels[currentLang][5], color: "bg-green-600" };
  };

  const passwordStrength = getPasswordStrength();

  if (authLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 animate-ken-burns"
          style={{
            backgroundImage: "url('/images/asset-web/baner-2.png')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-pulse">
            <img
              src="/images/asset-web/logo-fav.png"
              alt="Hokiindo Raya"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-white">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">
              Daftar ke Hokiindo
            </CardTitle>
            <p className="text-gray-600">
              Buat akun untuk mulai berbelanja
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Konfirmasi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Daftar'}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Sudah punya akun? Masuk di sini
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LanguageProvider>
  );
}

export default function RegisterPage() {
  return (
    <LanguageProvider>
      <RegisterPageContent />
    </LanguageProvider>
  );
} 