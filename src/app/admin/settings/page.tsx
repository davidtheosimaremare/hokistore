"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  ArrowLeft,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Upload,
  Image as ImageIcon,
  FileText,
  Palette,
  Shield,
  Bell,
  Database,
  Users,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

// Mock settings data
const initialSettings = {
  general: {
    siteName: "Hokiindo Raya",
    siteTagline: "Distributor Siemens Terbaik dan Terpercaya",
    logo: "/images/logo.png",
    favicon: "/images/asset-web/logo-fav.png"
  },
  contact: {
    email: "info@hokiindo.com",
    phone: "+62 21 1234 5678",
    whatsapp: "+62 812 3456 7890",
    address: "Jl. Industri Raya No. 123, Jakarta Timur 13920",
    googleMaps: "https://maps.google.com/..."
  },
  social: {
    facebook: "https://facebook.com/hokiindoraya",
    instagram: "https://instagram.com/hokiindoraya",
    linkedin: "https://linkedin.com/company/hokiindoraya",
    youtube: "https://youtube.com/@hokiindoraya"
  },
  business: {
    companyName: "PT Hokiindo Raya",
    npwp: "01.234.567.8-901.000",
    siup: "1234/SIUP/PK/VII/2020",
    businessHours: "08:00 - 17:00 WIB",
    workingDays: "Senin - Sabtu"
  },
  seo: {
    metaTitle: "Hokiindo Raya - Distributor Resmi Siemens Indonesia",
    metaDescription: "Distributor resmi produk Siemens di Indonesia. Solusi otomasi industri terdepan dengan garansi resmi dan support 24/7.",
    keywords: "siemens, distributor, otomasi industri, plc, hmi, motor drive"
  },
  notification: {
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true,
    customerNotifications: true
  }
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push("/admin/login");
      return;
    }
  }, [router]);

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social Media", icon: MessageSquare },
    { id: "business", label: "Business Info", icon: FileText },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Website Settings</h1>
                <p className="text-sm text-gray-500">Configure your website settings and preferences</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <p className="text-sm text-gray-500">Basic website information and branding</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.general.siteName}
                        onChange={(e) => handleInputChange("general", "siteName", e.target.value)}
                        placeholder="Enter site name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteTagline">Site Tagline</Label>
                      <Input
                        id="siteTagline"
                        value={settings.general.siteTagline}
                        onChange={(e) => handleInputChange("general", "siteTagline", e.target.value)}
                        placeholder="Enter site tagline"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Favicon</Label>
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Favicon
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Settings */}
            {activeTab === "contact" && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <p className="text-sm text-gray-500">Company contact details and location</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.contact.email}
                        onChange={(e) => handleInputChange("contact", "email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.contact.phone}
                        onChange={(e) => handleInputChange("contact", "phone", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        value={settings.contact.whatsapp}
                        onChange={(e) => handleInputChange("contact", "whatsapp", e.target.value)}
                        placeholder="Enter WhatsApp number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <textarea
                      id="address"
                      value={settings.contact.address}
                      onChange={(e) => handleInputChange("contact", "address", e.target.value)}
                      placeholder="Enter company address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="googleMaps">Google Maps URL</Label>
                    <Input
                      id="googleMaps"
                      value={settings.contact.googleMaps}
                      onChange={(e) => handleInputChange("contact", "googleMaps", e.target.value)}
                      placeholder="Enter Google Maps URL"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media Settings */}
            {activeTab === "social" && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <p className="text-sm text-gray-500">Social media profiles and links</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook URL</Label>
                      <Input
                        id="facebook"
                        value={settings.social.facebook}
                        onChange={(e) => handleInputChange("social", "facebook", e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram URL</Label>
                      <Input
                        id="instagram"
                        value={settings.social.instagram}
                        onChange={(e) => handleInputChange("social", "instagram", e.target.value)}
                        placeholder="https://instagram.com/yourpage"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        value={settings.social.linkedin}
                        onChange={(e) => handleInputChange("social", "linkedin", e.target.value)}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube URL</Label>
                      <Input
                        id="youtube"
                        value={settings.social.youtube}
                        onChange={(e) => handleInputChange("social", "youtube", e.target.value)}
                        placeholder="https://youtube.com/@yourchannel"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Info Settings */}
            {activeTab === "business" && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <p className="text-sm text-gray-500">Legal business information and operating hours</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={settings.business.companyName}
                        onChange={(e) => handleInputChange("business", "companyName", e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="npwp">NPWP</Label>
                      <Input
                        id="npwp"
                        value={settings.business.npwp}
                        onChange={(e) => handleInputChange("business", "npwp", e.target.value)}
                        placeholder="Enter NPWP number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siup">SIUP</Label>
                      <Input
                        id="siup"
                        value={settings.business.siup}
                        onChange={(e) => handleInputChange("business", "siup", e.target.value)}
                        placeholder="Enter SIUP number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessHours">Business Hours</Label>
                      <Input
                        id="businessHours"
                        value={settings.business.businessHours}
                        onChange={(e) => handleInputChange("business", "businessHours", e.target.value)}
                        placeholder="e.g., 08:00 - 17:00 WIB"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workingDays">Working Days</Label>
                      <Input
                        id="workingDays"
                        value={settings.business.workingDays}
                        onChange={(e) => handleInputChange("business", "workingDays", e.target.value)}
                        placeholder="e.g., Senin - Sabtu"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO Settings */}
            {activeTab === "seo" && (
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <p className="text-sm text-gray-500">Search engine optimization settings</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={settings.seo.metaTitle}
                      onChange={(e) => handleInputChange("seo", "metaTitle", e.target.value)}
                      placeholder="Enter meta title"
                    />
                    <p className="text-xs text-gray-500">Recommended length: 50-60 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <textarea
                      id="metaDescription"
                      value={settings.seo.metaDescription}
                      onChange={(e) => handleInputChange("seo", "metaDescription", e.target.value)}
                      placeholder="Enter meta description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">Recommended length: 150-160 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      value={settings.seo.keywords}
                      onChange={(e) => handleInputChange("seo", "keywords", e.target.value)}
                      placeholder="Enter keywords separated by commas"
                    />
                    <p className="text-xs text-gray-500">Separate keywords with commas</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <p className="text-sm text-gray-500">Configure email and system notifications</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(settings.notification).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {key === 'emailNotifications' && 'Receive general email notifications'}
                            {key === 'orderNotifications' && 'Get notified about new orders'}
                            {key === 'stockAlerts' && 'Receive low stock alerts'}
                            {key === 'customerNotifications' && 'Get notified about customer activities'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => handleInputChange("notification", key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 