"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Check, Zap, Settings, Cpu, ArrowRight, ArrowLeft, Globe } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import PolicyModal from "@/components/PolicyModal";

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

export default function RegisterPage() {
  return (
    <LanguageProvider>
      <RegisterContent />
    </LanguageProvider>
  );
}

function RegisterContent() {
  const router = useRouter();
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { translations: t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(1); // 1 = name, 2 = email, 3 = password
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
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

  const validateName = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name) {
      newErrors.name = t.auth.nameRequired || "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = t.auth.nameTooShort || "Name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = t.auth.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.auth.invalidEmail;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.password) {
      newErrors.password = t.auth.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = t.auth.passwordTooShort;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.auth.confirmPasswordRequired || "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.auth.passwordMismatch;
    }

    if (!agreeToTerms) {
      newErrors.terms = t.auth.termsRequired || "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameNext = () => {
    if (validateName()) {
      setCurrentStep(2);
      setMessage(null);
    }
  };

  const handleEmailNext = () => {
    if (validateEmail()) {
      setCurrentStep(3);
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNameNext();
      return;
    }
    
    if (currentStep === 2) {
      handleEmailNext();
      return;
    }

    if (!validatePassword()) return;

    setIsLoading(true);
    setMessage(null);
    
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      if (error) {
        setMessage({ type: 'error', text: t.auth.registerError });
      } else {
        setMessage({ type: 'success', text: t.auth.registerSuccess });
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.auth.registerErrorGeneral || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setMessage({ type: 'error', text: t.auth.googleLoginError });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.auth.googleLoginErrorGeneral });
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToStep = (step: number) => {
    setCurrentStep(step);
    setErrors({});
    setMessage(null);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Width Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 animate-ken-burns"
        style={{
          backgroundImage: "url('/images/asset-web/baner-2.png')"
        }}
      ></div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/75"></div>
      
      {/* Red overlay for brand consistency */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F90020]/30 via-black/20 to-[#F90020]/40"></div>
      
      {/* Additional dark gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#F90020]/30 rounded-full animate-float-slow"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-[#F90020]/40 rounded-full animate-float-medium animation-delay-1000"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-[#F90020]/20 rounded-full animate-float-fast animation-delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#F90020]/35 rounded-full animate-float-slow animation-delay-3000"></div>
        <div className="absolute top-60 left-40 w-1 h-1 bg-[#F90020]/25 rounded-full animate-float-medium animation-delay-4000"></div>
        <div className="absolute top-80 right-60 w-2 h-2 bg-[#F90020]/30 rounded-full animate-float-slow animation-delay-2500"></div>
        <div className="absolute bottom-60 right-40 w-1 h-1 bg-[#F90020]/40 rounded-full animate-float-fast animation-delay-3500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-lg text-center animate-fade-in-up">
            <div className="mb-8">
              {/* Logo */}
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl p-4 animate-pulse-glow border-4 border-[#F90020]/30">
                <img
                  src="/images/asset-web/logo-fav.png"
                  alt="Hokiindo Raya"
                  className="w-full h-full object-contain transform hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* Brand Name */}
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl animate-text-shimmer">
                <span className="text-[#F90020]">Hokiindo</span> Raya
              </h1>
              
              {/* SIEMENS Partner */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-[#F90020]/30 mb-8 animate-slide-in-left animation-delay-500">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-[#F90020] rounded-full flex items-center justify-center animate-pulse">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[#F90020] font-bold text-xl">
                    {t.auth.siemensDistributor}
                  </span>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-lg text-white mb-8 drop-shadow-lg font-medium animate-fade-in animation-delay-700">
                {t.hero.heroDescription}
              </p>
            </div>
            
            {/* Decorative product categories with icons */}
            <div className="grid grid-cols-3 gap-6 opacity-90">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 animate-bounce-in animation-delay-1000 border-2 border-[#F90020]/20">
                <Zap className="w-8 h-8 text-[#F90020] mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-gray-700 font-semibold">
                  {t.auth.electricalPanels}
                </p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 animate-bounce-in animation-delay-1200 border-2 border-[#F90020]/20">
                <Settings className="w-8 h-8 text-[#F90020] mx-auto mb-2 animate-spin-slow" />
                <p className="text-xs text-gray-700 font-semibold">
                  {t.auth.automation}
                </p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 animate-bounce-in animation-delay-1400 border-2 border-[#F90020]/20">
                <Cpu className="w-8 h-8 text-[#F90020] mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-gray-700 font-semibold">
                  {t.auth.motorControl}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Multi-Step Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-12 min-h-screen">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl p-2 border-2 border-[#F90020]/30">
                <img
                  src="/images/asset-web/logo-fav.png"
                  alt="Hokiindo Raya"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-2xl">
                <span className="text-[#F90020]">Hokiindo</span> Raya
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-1 drop-shadow-lg">
                {t.auth.siemensDistributor}
              </p>
            </div>

            {/* Multi-Step Register Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#F90020]/20 p-4 sm:p-6 md:p-8 animate-fade-in animation-delay-700">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.auth.registerButton}</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {currentStep === 1 ? (t.auth.enterNamePrompt || "Enter your full name") : 
                   currentStep === 2 ? t.auth.enterEmailPrompt : 
                   (t.auth.createPasswordPrompt || "Create a secure password")}
                </p>
                
                {/* Step Indicator */}
                <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${
                    currentStep >= 1 ? 'bg-[#F90020]' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-4 h-0.5 sm:w-6 sm:h-1 rounded-full transition-colors duration-300 ${
                    currentStep >= 2 ? 'bg-[#F90020]' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${
                    currentStep >= 2 ? 'bg-[#F90020]' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-4 h-0.5 sm:w-6 sm:h-1 rounded-full transition-colors duration-300 ${
                    currentStep >= 3 ? 'bg-[#F90020]' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${
                    currentStep >= 3 ? 'bg-[#F90020]' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`flex items-center p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 transition-all duration-300 ${
                  message.type === 'error' 
                    ? 'bg-red-50 border-2 border-[#F90020]/30 text-[#F90020]' 
                    : 'bg-green-50 border-2 border-green-300 text-green-700'
                }`}>
                  {message.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Step 1: Name Field */}
                {currentStep === 1 && (
                  <div className="animate-slide-in-right">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.auth.fullName || "Full Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 text-sm sm:text-base ${
                          errors.name ? 'border-[#F90020] bg-red-50' : 'border-gray-200 hover:border-[#F90020]/30'
                        }`}
                        placeholder={t.auth.fullNamePlaceholder || "Enter your full name"}
                        autoFocus
                      />
                      {errors.name && (
                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F90020]" />
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-xs sm:text-sm text-[#F90020] flex items-center font-medium">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 2: Email Field */}
                {currentStep === 2 && (
                  <div className="animate-slide-in-right">
                    {/* Show name for context */}
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gray-100 rounded-lg flex items-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate flex-1">{formData.name}</span>
                      <button
                        type="button"
                        onClick={() => goBackToStep(1)}
                        className="ml-2 text-[#F90020] hover:text-[#F90020]/80 text-xs sm:text-sm font-medium flex items-center shrink-0"
                      >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {t.auth.change}
                      </button>
                    </div>

                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t.auth.email}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 text-sm sm:text-base ${
                          errors.email ? 'border-[#F90020] bg-red-50' : 'border-gray-200 hover:border-[#F90020]/30'
                        }`}
                        placeholder={t.auth.emailPlaceholder}
                        autoFocus
                      />
                      {errors.email && (
                        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F90020]" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-xs sm:text-sm text-[#F90020] flex items-center font-medium">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 3: Password Fields */}
                {currentStep === 3 && (
                  <div className="animate-slide-in-right space-y-4 sm:space-y-6">
                    {/* Show email for context */}
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gray-100 rounded-lg flex items-center">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate flex-1">{formData.email}</span>
                      <button
                        type="button"
                        onClick={() => goBackToStep(2)}
                        className="ml-2 text-[#F90020] hover:text-[#F90020]/80 text-xs sm:text-sm font-medium flex items-center shrink-0"
                      >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {t.auth.change}
                      </button>
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.auth.password}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 text-sm sm:text-base ${
                            errors.password ? 'border-[#F90020] bg-red-50' : 'border-gray-200 hover:border-[#F90020]/30'
                          }`}
                          placeholder={t.auth.passwordPlaceholder}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F90020] transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{t.auth.passwordStrength || "Password strength"}</span>
                            <span className={`text-xs font-semibold ${
                              passwordStrength.label.includes('Strong') || passwordStrength.label.includes('Kuat') ? 'text-green-600' :
                              passwordStrength.label.includes('Good') || passwordStrength.label.includes('Baik') ? 'text-blue-600' :
                              passwordStrength.label.includes('Fair') || passwordStrength.label.includes('Cukup') ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {errors.password && (
                        <p className="mt-2 text-xs sm:text-sm text-[#F90020] flex items-center font-medium">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.auth.confirmPassword}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 text-sm sm:text-base ${
                            errors.confirmPassword ? 'border-[#F90020] bg-red-50' : 
                            formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500 bg-green-50' :
                            'border-gray-200 hover:border-[#F90020]/30'
                          }`}
                          placeholder={t.auth.confirmPasswordPlaceholder || "Confirm your password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F90020] transition-colors duration-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                        {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                          <div className="absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-xs sm:text-sm text-[#F90020] flex items-center font-medium">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        className="w-4 h-4 text-[#F90020] border-gray-300 rounded focus:ring-[#F90020] mt-1"
                        required
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                      />
                      <label htmlFor="terms" className="ml-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {t.auth.byLoggingIn}{" "}
                        <button 
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-[#F90020] hover:underline font-medium hover:text-[#F90020]/80 transition-colors duration-200"
                        >
                          {t.auth.privacyPolicy}
                        </button>
                        {" "}{t.auth.and}{" "}
                        <button 
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-[#F90020] hover:underline font-medium hover:text-[#F90020]/80 transition-colors duration-200"
                        >
                          {t.auth.termsConditions}
                        </button>
                        {" "}Hokiindo.
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-xs sm:text-sm text-[#F90020] flex items-center font-medium">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {errors.terms}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#F90020] hover:bg-[#F90020]/90 text-white py-3 sm:py-4 px-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border-2 border-[#F90020] hover:border-[#F90020]/90 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      {currentStep === 3 ? (t.auth.creatingAccount || "Creating Account...") : t.auth.loading}
                    </div>
                  ) : (
                    <>
                      {currentStep === 3 ? t.auth.registerButton : t.auth.continue}
                      {currentStep < 3 && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
                    </>
                  )}
                </button>

                {/* Google Registration - Only on first step */}
                {currentStep === 1 && (
                  <>
                    {/* Divider */}
                    <div className="relative my-4 sm:my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium text-xs sm:text-sm">
                          {t.auth.or}
                        </span>
                      </div>
                    </div>

                    {/* Google Registration Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-[#F90020]/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 bg-white disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      <span className="font-semibold text-gray-700 text-sm sm:text-base">{t.auth.signUpWithGoogle || "Sign up with Google"}</span>
                    </button>
                  </>
                )}

                {/* Sign In Link - Only on first step */}
                {currentStep === 1 && (
                  <div className="text-center pt-3 sm:pt-4">
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {t.auth.alreadyHaveAccount}{" "}
                      <Link
                        href="/login"
                        className="text-[#F90020] hover:text-[#F90020]/80 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-2"
                      >
                        {t.auth.loginLink}
                      </Link>
                    </p>
                  </div>
                )}
              </form>

              {/* Language Switcher */}
              <div className="flex justify-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <LanguageSwitcher />
              </div>

              {/* Footer */}
              <div className="text-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-center mt-3 sm:mt-4 space-y-1 sm:space-y-0 sm:space-x-2">
                  <span className="text-[#F90020] font-bold text-xs sm:text-sm">Hokiindo Raya</span>
                  <span className="text-xs text-gray-400">
                    {t.auth.allRightsReserved}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      <PolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        type="privacy"
        translations={t}
      />
      
      <PolicyModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="terms"
        translations={t}
      />

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

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-15px) translateX(15px);
            opacity: 0.8;
          }
        }

        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.4;
          }
          33% {
            transform: translateY(-15px) translateX(-10px) scale(1.1);
            opacity: 0.8;
          }
          66% {
            transform: translateY(-25px) translateX(20px) scale(0.9);
            opacity: 0.6;
          }
        }

        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.2;
          }
          20% {
            transform: translateY(-30px) translateX(15px) rotate(90deg);
            opacity: 0.9;
          }
          40% {
            transform: translateY(-20px) translateX(-25px) rotate(180deg);
            opacity: 0.6;
          }
          60% {
            transform: translateY(-35px) translateX(10px) rotate(270deg);
            opacity: 0.8;
          }
          80% {
            transform: translateY(-10px) translateX(-15px) rotate(360deg);
            opacity: 0.4;
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-left {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(50px);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05) translateY(-10px);
          }
          70% {
            opacity: 0.9;
            transform: scale(0.95) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes text-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.2);
          }
        }

        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-text-shimmer {
          background: linear-gradient(90deg, #ffffff 0%, #ffffff 40%, #F90020 50%, #ffffff 60%, #ffffff 100%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          animation: text-shimmer 3s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
        }

        .animation-delay-1400 {
          animation-delay: 1.4s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-2500 {
          animation-delay: 2.5s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-3500 {
          animation-delay: 3.5s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Mobile viewport adjustments */
        @media (max-height: 700px) {
          .min-h-screen {
            min-height: 100vh;
          }
        }
        
        @media (max-width: 375px) {
          .max-w-md {
            max-width: 100%;
            margin: 0 0.5rem;
          }
        }
        
        /* Ensure modal content is accessible on small screens */
        @media (max-height: 600px) {
          .max-h-\[60vh\] {
            max-height: 50vh;
          }
        }
      `}</style>
    </div>
  );
} 