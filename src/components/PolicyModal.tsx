"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Shield, FileText, ExternalLink } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
  translations: any;
}

export default function PolicyModal({ isOpen, onClose, type, translations }: PolicyModalProps) {
  const content = type === 'privacy' ? translations.privacyPolicy : translations.termsOfService;
  
  const renderSection = (title: string, items: string[]) => (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
        {title}
      </h3>
      <ul className="space-y-1.5 sm:space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start text-gray-700">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
            <span className="text-xs sm:text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderPrivacyContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Introduction */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-[#F90020]">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#F90020] mr-1.5 sm:mr-2" />
          {content.introduction.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{content.introduction.content}</p>
      </div>

      {/* Information Collection */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
          {content.informationCollection.title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{content.informationCollection.personalInfo.title}</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {content.informationCollection.personalInfo.items.map((item: string, index: number) => (
                <li key={index} className="flex items-start text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#F90020] rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">{content.informationCollection.technicalInfo.title}</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {content.informationCollection.technicalInfo.items.map((item: string, index: number) => (
                <li key={index} className="flex items-start text-gray-700">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#F90020] rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* How We Use */}
      {renderSection(content.howWeUse.title, content.howWeUse.purposes)}

      {/* Information Sharing */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
          {content.informationSharing.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3">{content.informationSharing.content}</p>
        <ul className="space-y-1.5 sm:space-y-2">
          {content.informationSharing.situations.map((situation: string, index: number) => (
            <li key={index} className="flex items-start text-gray-700">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm leading-relaxed">{situation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Security */}
      {renderSection(content.dataSecurity.title, content.dataSecurity.measures)}

      {/* Your Rights */}
      {renderSection(content.yourRights.title, content.yourRights.rights)}

      {/* Cookies */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
          {content.cookies.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{content.cookies.content}</p>
      </div>

      {/* Changes */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
          {content.changes.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{content.changes.content}</p>
      </div>

      {/* Contact */}
      <div className="bg-[#F90020]/5 rounded-lg p-4 sm:p-6 border border-[#F90020]/20">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-[#F90020] mr-1.5 sm:mr-2" />
          {content.contact.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3">{content.contact.content}</p>
        <ul className="space-y-1.5 sm:space-y-2">
          {content.contact.details.map((detail: string, index: number) => (
            <li key={index} className="flex items-start text-gray-700">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#F90020] rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm font-medium">{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderTermsContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Acceptance */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border-l-4 border-[#F90020]">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#F90020] mr-1.5 sm:mr-2" />
          {content.acceptance.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{content.acceptance.content}</p>
      </div>

      {/* Services */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
          {content.services.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3">{content.services.description}</p>
        <ul className="space-y-1.5 sm:space-y-2">
          {content.services.serviceList.map((service: string, index: number) => (
            <li key={index} className="flex items-start text-gray-700">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#F90020] rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm leading-relaxed">{service}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Eligibility */}
      {renderSection(content.eligibility.title, content.eligibility.requirements)}

      {/* Account Responsibilities */}
      {renderSection(content.accountResponsibilities.title, content.accountResponsibilities.responsibilities)}

      {/* Ordering */}
      {renderSection(content.ordering.title, content.ordering.terms)}

      {/* Delivery */}
      {renderSection(content.delivery.title, content.delivery.policies)}

      {/* Warranty */}
      {renderSection(content.warranty.title, content.warranty.terms)}

      {/* Intellectual Property */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
          {content.intellectualProperty.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{content.intellectualProperty.content}</p>
      </div>

      {/* Limitation */}
      {renderSection(content.limitation.title, content.limitation.limitations)}

      {/* Termination */}
      {renderSection(content.termination.title, content.termination.conditions)}

      {/* Governing Law */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F90020] rounded-full mr-2 sm:mr-3"></div>
          {content.governingLaw.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{content.governingLaw.content}</p>
      </div>

      {/* Contact */}
      <div className="bg-[#F90020]/5 rounded-lg p-4 sm:p-6 border border-[#F90020]/20">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-[#F90020] mr-1.5 sm:mr-2" />
          {content.contact.title}
        </h3>
        <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3">{content.contact.content}</p>
        <ul className="space-y-1.5 sm:space-y-2">
          {content.contact.details.map((detail: string, index: number) => (
            <li key={index} className="flex items-start text-gray-700">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#F90020] rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm font-medium">{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Background with same style as login page */}
          <div className="fixed inset-0">
            {/* Background Image with Ken Burns effect */}
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
          </div>
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-4xl mx-2 sm:mx-4 transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-2xl transition-all border-2 border-[#F90020]/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#F90020] to-[#F90020]/80 px-4 sm:px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {type === 'privacy' ? (
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2 sm:mr-3" />
                      ) : (
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2 sm:mr-3" />
                      )}
                      <div>
                        <Dialog.Title as="h3" className="text-lg sm:text-xl font-bold text-white">
                          {content.title}
                        </Dialog.Title>
                        <p className="text-white/90 text-xs sm:text-sm mt-1">{content.lastUpdated}</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto p-4 sm:p-6">
                  {type === 'privacy' ? renderPrivacyContent() : renderTermsContent()}
                </div>

                {/* Footer */}
                <div className="bg-gray-50/90 backdrop-blur-sm px-4 sm:px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <div className="w-2 h-2 bg-[#F90020] rounded-full mr-2"></div>
                      PT Hokiindo Raya © 2024
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#F90020] text-white rounded-lg hover:bg-[#F90020]/90 transition-colors duration-200 font-medium text-sm sm:text-base"
                    >
                      {translations.common.close}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      {/* Add the same CSS animations as login page */}
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

        .animation-delay-1000 {
          animation-delay: 1s;
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
      `}</style>
    </Transition>
  );
} 