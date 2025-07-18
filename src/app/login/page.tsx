"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Check, Zap, Settings, Cpu, ArrowRight, ArrowLeft, Globe } from "lucide-react";
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
  const [translations, setTranslations] = useState<any>(idLang);

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

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginContent />
    </LanguageProvider>
  );
}

function LoginContent() {
  const router = useRouter();
  const { signIn, signInWithGoogle, resetPassword, user, loading: authLoading } = useAuth();
  const { translations: t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(1); // 1 = email, 2 = password
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Policy modal state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Get redirect parameter from URL
  const [redirectUrl, setRedirectUrl] = useState<string>('/dashboard');

  useEffect(() => {
    // Get redirect parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailNext = () => {
    if (validateEmail()) {
      setCurrentStep(2);
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleEmailNext();
      return;
    }

    if (!validatePassword()) return;

    setIsLoading(true);
    setMessage(null);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setMessage({ type: 'error', text: t.auth.loginError });
      } else {
        setMessage({ type: 'success', text: t.auth.loginSuccess + '! ' + t.auth.redirecting });
        setTimeout(() => router.push(redirectUrl), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.auth.loginErrorGeneral });
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setMessage({ type: 'error', text: t.auth.googleLoginError });
      } else {
        // Redirect will be handled by the useEffect hook when user state changes
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.auth.googleLoginErrorGeneral });
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToEmail = () => {
    setCurrentStep(1);
    setErrors({});
    setMessage(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage({ type: 'error', text: t.auth.emailRequired });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordMessage({ type: 'error', text: t.auth.invalidEmail });
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage(null);

    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      if (error) {
        setForgotPasswordMessage({ type: 'error', text: t.auth.resetPasswordError || 'Error sending reset email' });
      } else {
        setForgotPasswordMessage({ 
          type: 'success', 
          text: t.auth.resetPasswordSuccess || 'Reset password email sent! Please check your inbox.' 
        });
        setTimeout(() => {
          setShowForgotPasswordModal(false);
          setForgotPasswordEmail("");
          setForgotPasswordMessage(null);
        }, 3000);
      }
    } catch (error) {
      setForgotPasswordMessage({ type: 'error', text: t.auth.resetPasswordErrorGeneral || 'Error sending reset email' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const openForgotPasswordModal = () => {
    setForgotPasswordEmail(formData.email);
    setShowForgotPasswordModal(true);
    setForgotPasswordMessage(null);
  };

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
      {/* Full Width Background Image - Fixed for mobile */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat transform scale-110 animate-ken-burns"
        style={{
          backgroundImage: "url('/images/asset-web/baner-2.png')",
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Dark overlay for better text readability - Fixed positioning */}
      <div className="fixed inset-0 w-full h-full bg-black/75"></div>
      
      {/* Red overlay for brand consistency - Fixed positioning */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#F90020]/30 via-black/20 to-[#F90020]/40"></div>
      
      {/* Additional dark gradient for depth - Fixed positioning */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
      
      {/* Floating particles - Fixed positioning */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
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

        {/* Right side - Multi-Step Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 min-h-screen">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8 sm:mb-10 pt-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl p-3 border-2 border-[#F90020]/30">
                <img
                  src="/images/asset-web/logo-fav.png"
                  alt="Hokiindo Raya"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-2xl">
                <span className="text-[#F90020]">Hokiindo</span> Raya
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-2 drop-shadow-lg">
                {t.auth.siemensDistributor}
              </p>
            </div>

            {/* Multi-Step Login Form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#F90020]/20 p-6 sm:p-8 md:p-10 animate-fade-in animation-delay-700 mb-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.auth.loginButton}</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {currentStep === 1 ? t.auth.enterEmailPrompt : t.auth.enterPasswordPrompt}
                </p>
                
                {/* Step Indicator */}
                <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${
                    currentStep >= 1 ? 'bg-[#F90020]' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-6 h-0.5 sm:w-8 sm:h-1 rounded-full transition-colors duration-300 ${
                    currentStep >= 2 ? 'bg-[#F90020]' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${
                    currentStep >= 2 ? 'bg-[#F90020]' : 'bg-gray-300'
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
                {/* Step 1: Email Field */}
                {currentStep === 1 && (
                  <div className="animate-slide-in-right">
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
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-4 sm:py-4 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 text-base touch-manipulation ${
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

                {/* Step 2: Password Field */}
                {currentStep === 2 && (
                  <div className="animate-slide-in-right">
                    {/* Show email for context */}
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gray-100 rounded-lg flex items-center">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate flex-1">{formData.email}</span>
                      <button
                        type="button"
                        onClick={goBackToEmail}
                        className="ml-2 text-[#F90020] hover:text-[#F90020]/80 text-xs sm:text-sm font-medium flex items-center shrink-0"
                      >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {t.auth.change}
                      </button>
                    </div>

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
                                                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-4 sm:py-4 border-2 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500 text-base touch-manipulation ${
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
                    {errors.password && (
                      <p className="mt-2 text-xs sm:text-sm text-[#F90020] flex items-center font-medium">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                    
                    {/* Forgot Password Link */}
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={openForgotPasswordModal}
                        className="text-xs sm:text-sm text-[#F90020] hover:text-[#F90020]/80 font-medium transition-colors duration-200 underline decoration-1 underline-offset-2"
                      >
                        {t.auth.forgotPassword || 'Lupa Password?'}
                      </button>
                    </div>
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
                      {currentStep === 1 ? t.auth.loading : t.auth.loginButton}
                    </div>
                  ) : (
                    <>
                      {currentStep === 1 ? t.auth.continue : t.auth.loginButton}
                      {currentStep === 1 && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
                    </>
                  )}
                </button>

                {/* Google Login - Only on first step */}
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

                    {/* Google Login Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-[#F90020]/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 bg-white disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      <span className="font-semibold text-gray-700 text-sm sm:text-base">{t.auth.signInWithGoogle}</span>
                    </button>
                  </>
                )}

                {/* Sign Up Link - Only on first step */}
                {currentStep === 1 && (
                  <div className="text-center pt-3 sm:pt-4">
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {t.auth.dontHaveAccount}{" "}
                      <Link
                        href="/register"
                        className="text-[#F90020] hover:text-[#F90020]/80 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-2"
                      >
                        {t.auth.registerLink}
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
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t.auth.byLoggingIn}{" "}
                  <button 
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-[#F90020] hover:underline font-medium hover:text-[#F90020]/80 transition-colors duration-200"
                  >
                    {t.auth.privacyPolicy}
                  </button>
                  {" "}{t.auth.and}{" "}
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="text-[#F90020] hover:underline font-medium hover:text-[#F90020]/80 transition-colors duration-200"
                  >
                    {t.auth.termsConditions}
                  </button>
                  {" "}Hokiindo.
                </p>
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

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t.auth.resetPassword || 'Reset Password'}
                </h3>
                <p className="text-sm text-gray-600">
                  {t.auth.resetPasswordDescription || 'Masukkan email Anda dan kami akan mengirimkan link untuk reset password'}
                </p>
              </div>

              {/* Message */}
              {forgotPasswordMessage && (
                <div className={`flex items-center p-4 rounded-xl mb-4 transition-all duration-300 ${
                  forgotPasswordMessage.type === 'error' 
                    ? 'bg-red-50 border-2 border-[#F90020]/30 text-[#F90020]' 
                    : 'bg-green-50 border-2 border-green-300 text-green-700'
                }`}>
                  {forgotPasswordMessage.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{forgotPasswordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.auth.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#F90020] transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-500"
                      placeholder={t.auth.emailPlaceholder}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setForgotPasswordEmail("");
                      setForgotPasswordMessage(null);
                    }}
                    className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50"
                  >
                    {t.common.cancel || 'Batal'}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 bg-[#F90020] hover:bg-[#F90020]/90 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {forgotPasswordLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t.auth.sending || 'Mengirim...'}
                      </div>
                    ) : (
                      t.auth.sendResetLink || 'Kirim Link Reset'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Mobile viewport adjustments and full background fix */
        .min-h-screen {
          min-height: 100vh;
          min-height: 100dvh; /* Dynamic viewport height for mobile */
        }
        
        /* Ensure full background coverage on all devices */
        .fixed.inset-0 {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important; /* Dynamic viewport height */
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
          }
          
          .fixed.inset-0 {
            background-attachment: scroll !important; /* Fixed attachment can cause issues on mobile */
          }
          
          /* Ensure proper viewport handling */
          .min-h-screen {
            min-height: calc(100vh + env(safe-area-inset-bottom));
            min-height: calc(100dvh + env(safe-area-inset-bottom));
          }
        }
        
        @media (max-height: 700px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: 100dvh;
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
        
        /* Prevent horizontal scroll */
        html, body {
          overflow-x: hidden;
          width: 100%;
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 768px) {
          button, input[type="submit"], input[type="button"] {
            min-height: 44px; /* Apple's recommended minimum touch target */
          }
          
          /* Better spacing for form elements */
          .space-y-4 > * + * {
            margin-top: 1.5rem; /* Increase spacing on mobile */
          }
          
          /* Improve readability on small screens */
          input, textarea, select {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
        
        /* Fix for iOS Safari viewport height issues */
        @supports (-webkit-touch-callout: none) {
          .min-h-screen {
            min-height: -webkit-fill-available;
          }
        }
      `}</style>
    </div>
  );
} 