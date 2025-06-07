export default {
  // Navigation
  nav: {
    home: "Home",
    products: "Products", 
    services: "Services",
    projects: "Projects",
    about: "About",
    contact: "Contact",
    categories: "Product Categories",
    login: "Login"
  },

  // Product Categories
  categories: [
    {
      name: "Drive Technology",
      description: "Variable frequency drives & motor control",
      href: "/products/drive-technology"
    },
    {
      name: "Automation Technology", 
      description: "PLCs, HMIs & industrial automation",
      href: "/products/automation-technology"
    },
    {
      name: "Low Voltage Control and Distribution",
      description: "Switchgear, panels & distribution systems",
      href: "/products/low-voltage"
    },
    {
      name: "AutoGo Series",
      description: "Automotive grade electrical solutions",
      href: "/products/autogo-series"
    },
    {
      name: "LiteGo Series",
      description: "Compact and efficient lighting controls",
      href: "/products/litego-series"
    },
    {
      name: "MateGo Series",
      description: "Modular automation components",
      href: "/products/matego-series"
    },
    {
      name: "Industrial Lighting",
      description: "LED fixtures & lighting solutions",
      href: "/products/industrial-lighting"
    },
    {
      name: "Busduct",
      description: "Power distribution busbar systems",
      href: "/products/busduct"
    }
  ],

  // Hero Section
  hero: {
    companyBadge: "Hokiindo Raya",
    heroTitle: "Leading Industrial Automation Solutions",
    heroSubtitle: "Advanced Industrial Control Systems", 
    heroDescription: "Enhance production efficiency with leading Siemens automation systems",
    exploreButton: "Explore Products",
    consultationButton: "Free Consultation",
    slides: [
        {
            title: "Official Siemens Distributor",
            description: "International-standard electrical solutions"
          },
          {
            title: "All in One, Best Price",
            description: "Shop electricals with ease – Retail & Bulk Available"
          },
          {
            title: "Genuine, Guaranteed, Ready to Ship",
            description: "Complete and trusted electrical products"
          }
    ]
  },

  // Trusted Companies Section
  trusted: {
    title: "Trusted by more than 10,000 Companies",
    subtitle: "Trusted partner for electrical industrial solutions",
    companies: "More than 10,000 companies",
    rating: "4.9/5 satisfaction rating",
    warranty: "Official warranty",
    companyLogos: [
      {
        name: "PT Astra International",
        image: "/images/asset-web/company-1.png",
        alt: "PT Astra International Logo"
      },
      {
        name: "PT United Tractors",
        image: "/images/asset-web/company-2.png",
        alt: "PT United Tractors Logo"
      },
      {
        name: "PT Pertamina",
        image: "/images/asset-web/company-3.png",
        alt: "PT Pertamina Logo"
      },
      {
        name: "PT PLN (Persero)",
        image: "/images/asset-web/company-4.png",
        alt: "PT PLN Logo"
      },
      {
        name: "PT Semen Indonesia",
        image: "/images/asset-web/company-5.png",
        alt: "PT Semen Indonesia Logo"
      },
      {
        name: "PT Unilever Indonesia",
        image: "/images/asset-web/company-6.png",
        alt: "PT Unilever Indonesia Logo"
      }
    ]
  },

  // Featured Products Section
  featuredProducts: {
    title: "Featured Products for You",
    subtitle: "Best solutions for your industrial and business needs"
  },

  // Why Choose Section  
  whyChoose: {
    title: "Why Choose Hokiindo",
    subtitle: "Trust, quality, and the best service for your electrical industrial solutions",
    ctaButton: "Explore Products Now",
    reasons: [
      {
        title: "Professional Expertise",
        description: "Expert team with 15+ years experience in industrial automation systems and electrical distribution",
        image: "/images/asset-web/mengapa-1.png"
      },
      {
        title: "Fast Response",
        description: "24/7 service with response time less than 2 hours for emergency support",
        image: "/images/asset-web/mengapa-2.png"
      },
      {
        title: "Trusted Partner",
        description: "Trusted by 10,000+ companies with 4.9/5 satisfaction rating",
        image: "/images/asset-web/mengapa-3.png"
      },
      {
        title: "Premium Products",
        description: "Original Siemens products with official warranty and international certification",
        image: "/images/asset-web/mengapa-4.png"
      }
    ]
  },

  // Projects Section
  projects: {
    title: "Project Reference",
    subtitle: "Some Projects We Have Completed",
    viewDetails: "View Project Details",
    viewAll: "View All Projects",
    projectList: [
      {
        id: 1,
        title: "PT Astra International - Factory Automation System",
        description: "Complete control and monitoring system implementation for automotive production line",
        location: "Jakarta, Indonesia",
        year: "2023",
        client: "PT Astra International",
        image: "https://picsum.photos/600/400?random=1",
        category: "Industrial Automation"
      },
      {
        id: 2,
        title: "PLN Substation - Power Distribution System",
        description: "Distribution panel installation and monitoring system for 150kV substation",
        location: "Surabaya, Indonesia", 
        year: "2023",
        client: "PLN (Persero)",
        image: "https://picsum.photos/600/400?random=2",
        category: "Power Distribution"
      },
      {
        id: 3,
        title: "Pertamina Refinery - Process Control",
        description: "Process control system and safety upgrade for oil refinery unit",
        location: "Cilacap, Indonesia",
        year: "2022", 
        client: "Pertamina",
        image: "https://picsum.photos/600/400?random=3",
        category: "Process Control"
      },
      {
        id: 4,
        title: "Semen Indonesia - Smart Factory",
        description: "Cement factory digitalization with IoT sensors and real-time monitoring",
        location: "Gresik, Indonesia",
        year: "2023",
        client: "Semen Indonesia",
        image: "https://picsum.photos/600/400?random=4",
        category: "Smart Manufacturing"
      },
      {
        id: 5,
        title: "TPPI Petrochemical - Safety System",
        description: "Security system installation and emergency shutdown for petrochemical complex",
        location: "Tuban, Indonesia",
        year: "2022",
        client: "Trans Pacific Petrochemical",
        image: "https://picsum.photos/600/400?random=5",
        category: "Safety Systems"
      },
      {
        id: 6,
        title: "Unilever Factory - Energy Management",
        description: "Energy management system and electricity consumption optimization for consumer goods factory",
        location: "Bekasi, Indonesia",
        year: "2023",
        client: "Unilever Indonesia",
        image: "https://picsum.photos/600/400?random=6",
        category: "Energy Management"
      }
    ]
  },

  // Products Section
  products: {
    title: 'Products',
    subtitle: "Explore our complete collection of Siemens products",
    loading: 'Loading products...',
    loadingMore: 'Loading more products...',
    allProductsLoaded: 'All products loaded',
    error: 'An Error Occurred',
    retry: 'Try Again',
    filter: 'Filter',
    category: 'Category',
    allCategories: 'All Categories',
    sort: 'Sort',
    sortByNameAsc: 'Name A-Z',
    sortByNameDesc: 'Name Z-A',
    sortByPriceAsc: 'Lowest Price',
    sortByPriceDesc: 'Highest Price',
    resetFilter: 'Reset Filter',
    showingProducts: 'Showing',
    noProductsFound: 'No products found',
    changeFilter: 'Try changing your filter or category',
    viewMode: 'View Mode',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    addToCart: 'Cart',
    viewDetails: 'View Details',
    viewAll: "View All",
    viewAllCategories: "View All Categories",
    contactForPrice: "Contact for Price"
  },

  // Consultation
  consultation: {
    floatingButton: "Free Consultation",
    modalTitle: "Free Consultation",
    modalSubtitle: "Contact our expert",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter your phone number", 
    submitButton: "Call Me",
    disclaimer: "We will contact you for free consultation within 15 minutes"
  },

  // Common
  common: {
    search: "Search products, categories, or brands...",
    searchMobile: "Search products...",
    close: "Close",
    loading: "Loading...",
    error: "An error occurred",
    back: "Back",
    contactUs: "Contact Our Team",
    companyTagline: "Best and Most Trusted Siemens Distributor",
    cancel: "Cancel"
  },

  // Cart Section
  cart: {
    title: "Shopping Cart",
    emptyCart: "Empty Cart",
    emptyCartMessage: "You haven't added any products to your cart yet",
    viewProducts: "View Products",
    backToCart: "Back to Cart",
    itemCount: "item",
    clearCart: "Clear Cart",
    removeItem: "Remove",
    viewDetail: "View Details",
    askProduct: "Ask About Product",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    freeShipping: "Free",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    freeShippingNote: "Free shipping",
    freeConsultation: "Free consultation via WhatsApp"
  },

  // Checkout Section
  checkout: {
    title: "Checkout",
    shippingInfo: "Shipping Information",
    fullName: "Full Name",
    phone: "Phone Number",
    email: "Email",
    address: "Full Address",
    city: "City",
    postalCode: "Postal Code",
    orderNotes: "Order Notes",
    fullNamePlaceholder: "Enter your full name",
    phonePlaceholder: "08xx xxxx xxxx",
    emailPlaceholder: "email@example.com",
    addressPlaceholder: "Street, Number, RT/RW, Village, District",
    cityPlaceholder: "City name",
    postalCodePlaceholder: "12345",
    orderNotesPlaceholder: "Special notes for order (optional)",
    orderViaMhatsApp: "Order via WhatsApp",
    processing: "Processing...",
    orderWillBeSent: "Order will be sent via WhatsApp for confirmation",
    required: "Required"
  },

  // Product Detail Section
  productDetail: {
    backToProducts: "Back to Products",
    productNotFound: "Product Not Found",
    productNotFoundMessage: "The product you are looking for was not found or has been removed",
    loadingProduct: "Loading product details...",
    productNumber: "Product No",
    shortName: "Short Name",
    brand: "Brand",
    model: "Model",
    category: "Category",
    warehouse: "Warehouse",
    stock: "Stock",
    price: "Price",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    askViaWhatsApp: "Ask via WhatsApp",
    shareProduct: "Share Product",
    specifications: "Specifications",
    description: "Description",
    relatedProducts: "Related Products",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    maxQuantity: "Maximum",
    minQuantity: "Minimum 1"
  },

  // Authentication Section
  auth: {
    loginTitle: "Login to Your Account",
    registerTitle: "Create New Account",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter password",
    confirmPasswordPlaceholder: "Confirm password",
    loginButton: "Login",
    registerButton: "Register",
    signInWithGoogle: "Sign in with Google",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    registerLink: "Register here",
    loginLink: "Login here",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",
    loading: "Processing...",
    loginSuccess: "Login successful",
    registerSuccess: "Registration successful, please check email for verification",
    loginError: "Invalid email or password",
    registerError: "Registration failed",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    passwordTooShort: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
    invalidEmail: "Invalid email format",
    logout: "Logout",
    dashboard: "Dashboard",
    profile: "Profile",
    myOrders: "My Orders",
    settings: "Settings",
    // Additional login page translations
    enterEmailPrompt: "Enter your email address",
    enterPasswordPrompt: "Enter your password",
    continue: "Continue",
    change: "Change",
    or: "or",
    redirecting: "Redirecting...",
    loginErrorGeneral: "An error occurred during login",
    googleLoginError: "Failed to login with Google",
    googleLoginErrorGeneral: "An error occurred during Google login",
    byLoggingIn: "By logging in, you agree to our",
    privacyPolicy: "Privacy Policy",
    and: "and",
    termsConditions: "Terms & Conditions",
    allRightsReserved: "All Rights Reserved",
    siemensDistributor: "Authorized Distributor of SIEMENS",
    electricalPanels: "Electrical Panels",
    automation: "Automation",
    motorControl: "Motor Control",
    // Additional register page translations
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    enterNamePrompt: "Enter your full name",
    createPasswordPrompt: "Create a secure password",
    confirmPasswordRequired: "Please confirm your password",
    nameRequired: "Name is required",
    nameTooShort: "Name must be at least 2 characters",
    termsRequired: "You must agree to the terms and conditions",
    confirmPasswordPlaceholder: "Confirm your password",
    passwordStrength: "Password strength",
    creatingAccount: "Creating Account...",
    registerErrorGeneral: "Registration failed. Please try again.",
    signUpWithGoogle: "Sign up with Google",
    // Forgot password translations
    resetPassword: "Reset Password",
    resetPasswordDescription: "Enter your email and we will send you a link to reset your password",
    sendResetLink: "Send Reset Link",
    sending: "Sending...",
    resetPasswordSuccess: "Password reset email sent! Please check your inbox.",
    resetPasswordError: "Failed to send reset password email",
    resetPasswordErrorGeneral: "An error occurred while sending reset password email"
  },

  // Privacy Policy
  privacyPolicy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: January 1, 2024",
    introduction: {
      title: "Introduction",
      content: "PT Hokiindo Raya ('we', 'company', or 'Hokiindo') is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, and protect your information when you use our services as an authorized distributor of Siemens and G-Comin products in Indonesia."
    },
    informationCollection: {
      title: "Information We Collect",
      personalInfo: {
        title: "Personal Information",
        items: [
          "Full name and contact information (email, phone number, address)",
          "Company information (company name, position, industry field)",
          "Transaction data and purchase history",
          "Product preferences and technical requirements",
          "Payment information (securely stored by payment service providers)"
        ]
      },
      technicalInfo: {
        title: "Technical Information",
        items: [
          "IP address and device information",
          "Website and application usage data",
          "Cookies and similar tracking technologies",
          "Activity logs and interactions with our services"
        ]
      }
    },
    howWeUse: {
      title: "How We Use Your Information",
      purposes: [
        "Process orders and provide customer service",
        "Provide technical consultation and product recommendations",
        "Send new product information and special offers",
        "Conduct analysis to improve our services",
        "Fulfill legal and regulatory obligations",
        "Prevent fraud and maintain platform security"
      ]
    },
    informationSharing: {
      title: "Information Sharing",
      content: "We do not sell or rent your personal information to third parties. We only share information in the following situations:",
      situations: [
        "With official Siemens and G-Comin partners for warranty and technical support purposes",
        "With trusted payment and logistics service providers",
        "When required by law or competent authorities",
        "With your explicit consent"
      ]
    },
    dataSecurity: {
      title: "Data Security",
      measures: [
        "256-bit SSL encryption for all data transmissions",
        "Multi-layered security systems and 24/7 monitoring",
        "Limited access only to authorized personnel",
        "Regular data backups and disaster recovery systems",
        "Regular security audits by independent third parties"
      ]
    },
    yourRights: {
      title: "Your Rights",
      rights: [
        "Access and update your personal information",
        "Request deletion of personal data (subject to certain conditions)",
        "Object to or restrict certain data processing",
        "Request data portability",
        "File complaints with data protection authorities"
      ]
    },
    cookies: {
      title: "Cookie Policy",
      content: "We use cookies to enhance your experience on our website. Cookies help us understand your preferences and provide relevant content. You can set cookie preferences through your browser settings."
    },
    changes: {
      title: "Policy Changes",
      content: "We may update this Privacy Policy from time to time. Material changes will be notified via email or website notification at least 30 days before taking effect."
    },
    contact: {
      title: "Contact Us",
      content: "If you have questions about this Privacy Policy, please contact us:",
      details: [
        "Email: privacy@hokiindo.com",
        "Phone: +62 21 1234 5678",
        "Address: Jl. Industri Raya No. 123, Jakarta 12345, Indonesia"
      ]
    }
  },

  // Terms of Service
  termsOfService: {
    title: "Terms & Conditions",
    lastUpdated: "Last updated: January 1, 2024",
    acceptance: {
      title: "Acceptance of Terms",
      content: "By accessing and using PT Hokiindo Raya services, you agree to be bound by these terms and conditions. If you disagree with these terms, please do not use our services."
    },
    services: {
      title: "Our Services",
      description: "PT Hokiindo Raya is an authorized distributor of Siemens and G-Comin products in Indonesia, providing:",
      serviceList: [
        "Sales of electrical and industrial automation products",
        "Technical consultation and engineering solutions",
        "After-sales service and technical support",
        "Product training and certification",
        "Installation and commissioning services (through certified partners)"
      ]
    },
    eligibility: {
      title: "User Eligibility",
      requirements: [
        "Minimum 18 years old or have legal capacity",
        "Have authority to represent company (for corporate accounts)",
        "Provide accurate and complete information",
        "Comply with all applicable laws and regulations"
      ]
    },
    accountResponsibilities: {
      title: "Account Responsibilities",
      responsibilities: [
        "Maintain confidentiality of your login credentials",
        "Responsible for all activities on your account",
        "Immediately report unauthorized use",
        "Update account information regularly",
        "Do not share access with unauthorized parties"
      ]
    },
    ordering: {
      title: "Ordering and Payment",
      terms: [
        "Prices may change without prior notice",
        "Order confirmation will be sent via email",
        "Payment must be made according to agreed terms",
        "We reserve the right to reject orders for certain reasons",
        "Custom orders cannot be cancelled"
      ]
    },
    delivery: {
      title: "Delivery and Receipt",
      policies: [
        "Delivery time is estimated and may change",
        "Risk of damage or loss transfers when goods are handed to courier",
        "Goods inspection must be done upon receipt",
        "Damage claims must be reported within 24 hours",
        "Incorrect delivery address is buyer's responsibility"
      ]
    },
    warranty: {
      title: "Warranty and Support",
      terms: [
        "Siemens and G-Comin products are warranted according to official manufacturer terms",
        "Warranty does not apply to damage due to misuse",
        "Warranty claims must be accompanied by valid purchase documents",
        "Warranty service is performed by official service centers",
        "Transportation costs for warranty claims are borne by buyer"
      ]
    },
    intellectualProperty: {
      title: "Intellectual Property Rights",
      content: "All content on our platform, including text, images, logos, and designs are protected by copyright. Siemens and G-Comin trademarks belong to their respective rights holders. Unauthorized use may result in legal action."
    },
    limitation: {
      title: "Limitation of Liability",
      limitations: [
        "Hokiindo is not responsible for indirect losses",
        "Our maximum liability is limited to purchase value",
        "We do not guarantee 100% uninterrupted service availability",
        "Force majeure is not included in our responsibility"
      ]
    },
    termination: {
      title: "Service Termination",
      conditions: [
        "We may terminate accounts that violate these terms",
        "Termination may be done without prior notice",
        "Payment obligations remain after termination",
        "Account data may be deleted after certain period"
      ]
    },
    governingLaw: {
      title: "Governing Law",
      content: "These terms and conditions are governed by the laws of the Republic of Indonesia. Any disputes will be resolved through Central Jakarta District Court or arbitration as agreed by the parties."
    },
    contact: {
      title: "Contact Information",
      content: "For questions regarding these terms and conditions:",
      details: [
        "Email: legal@hokiindo.com",
        "Phone: +62 21 1234 5678",
        "Address: Jl. Industri Raya No. 123, Jakarta 12345, Indonesia"
      ]
    }
  }
}; 