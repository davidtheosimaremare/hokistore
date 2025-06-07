"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { 
  ArrowLeft,
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Download,
  Share2,
  Package,
  Truck,
  Shield,
  Award,
  Clock,
  User,
  ThumbsUp,
  Filter,
  Settings,
  Zap,
  Building
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  sku: string;
  inStock: boolean;
  stockQuantity: number;
  category: string;
  summary: string;
  description: string;
  specifications: { [key: string]: string };
  features: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  datasheet?: string;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

// Sample product data
const products: Product[] = [
  {
    id: 1,
    name: "SIMATIC S7-1500 PLC",
    brand: "Siemens",
    model: "6ES7515-2AM01-0AB0",
    price: 45750000,
    originalPrice: 52000000,
    sku: "SIM-S7-1515-PN",
    inStock: true,
    stockQuantity: 12,
    category: "PLC Controllers",
    summary: "High-performance CPU for demanding automation tasks with integrated PROFINET interface",
    description: `The SIMATIC S7-1500 CPU 1515-2 PN is a powerful programmable logic controller designed for complex automation applications. With its advanced processing capabilities and integrated PROFINET interface, it delivers exceptional performance for demanding industrial environments.

This CPU features 500 KB work memory, supports up to 32 modules, and provides high-speed processing for time-critical applications. The integrated PROFINET interface enables seamless communication with distributed I/O and HMI devices.

Perfect for manufacturing automation, process control, and building automation applications where reliability and performance are critical.`,
    specifications: {
      "Processor": "ARM Cortex-A15 Quad Core 1.2 GHz",
      "Work Memory": "500 KB",
      "Load Memory": "8 MB",
      "Digital Inputs": "32",
      "Digital Outputs": "32",
      "Analog Inputs": "8",
      "Analog Outputs": "4",
      "Communication": "PROFINET, PROFIBUS DP",
      "Power Supply": "24V DC",
      "Dimensions": "147 x 129 x 80 mm",
      "Weight": "650 g",
      "Operating Temperature": "-25°C to +60°C",
      "Certification": "CE, UL, CSA"
    },
    features: [
      "High-performance ARM Cortex-A15 processor",
      "Integrated PROFINET interface",
      "Supports up to 32 expansion modules",
      "Web server for remote diagnostics",
      "Integrated motion control functions",
      "Fail-safe operation capability",
      "TIA Portal programming environment",
      "Cyber security features"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581094372533-dd7b90e27117?w=800&h=600&fit=crop"
    ],
    rating: 4.8,
    reviewCount: 24,
    datasheet: "/datasheets/simatic-s7-1515.pdf"
  },
  {
    id: 2,
    name: "SINAMICS G120 Drive",
    brand: "Siemens",
    model: "6SL3210-1KE23-2AF1",
    price: 32500000,
    sku: "SIN-G120-23AF1",
    inStock: true,
    stockQuantity: 8,
    category: "Motor Drives",
    summary: "Advanced variable frequency drive for precise motor control and energy efficiency",
    description: `The SINAMICS G120 Drive Controller is a versatile and powerful variable frequency drive designed for demanding motor control applications. With its modular design and advanced control algorithms, it provides exceptional performance for various industrial applications.

This drive controller features integrated safety functions, energy-efficient operation, and comprehensive diagnostic capabilities. The intuitive commissioning tools and flexible communication options make it ideal for both standalone and networked applications.

Perfect for pumps, fans, conveyors, and general purpose motor control applications where precision and reliability are essential.`,
    specifications: {
      "Power Range": "0.37 kW to 250 kW",
      "Voltage": "380V - 480V AC",
      "Frequency": "0 - 650 Hz",
      "Control Mode": "V/f, Vector Control",
      "Communication": "PROFINET, PROFIBUS DP, Modbus RTU",
      "Safety Rating": "SIL 2",
      "Protection Class": "IP20",
      "Dimensions": "185 x 275 x 195 mm",
      "Weight": "4.2 kg",
      "Operating Temperature": "-10°C to +50°C",
      "Certification": "CE, UL, CSA, CCC"
    },
    features: [
      "Modular converter system",
      "Integrated safety functions",
      "Energy-efficient operation",
      "Easy commissioning with STARTER software",
      "Comprehensive diagnostic functions",
      "Flexible communication options",
      "Dynamic motor control",
      "Overload protection"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.7,
    reviewCount: 18,
    datasheet: "/datasheets/sinamics-g120.pdf"
  },
  {
    id: 3,
    name: "SENTRON PAC Meter",
    brand: "Siemens",
    model: "7KM4212-0BA00-3AA0",
    price: 28900000,
    sku: "SEN-PAC4200-BA",
    inStock: true,
    stockQuantity: 15,
    category: "Power Monitoring",
    summary: "Advanced power monitoring device for comprehensive energy management",
    description: `The SENTRON PAC4200 is a high-precision power monitoring device designed for comprehensive energy management in industrial and commercial applications. This advanced meter provides accurate measurement and monitoring of electrical parameters.

With its modular design and extensive communication capabilities, the PAC4200 enables efficient energy management and helps optimize power consumption. The device features a clear display and intuitive operation for easy monitoring.

Ideal for substations, industrial plants, and commercial buildings where precise power monitoring is essential for energy efficiency and cost optimization.`,
    specifications: {
      "Measurement Accuracy": "Class 0.2S",
      "Voltage Range": "57.7V to 690V",
      "Current Range": "1A to 5A (via CT)",
      "Frequency": "45-65 Hz",
      "Display": "4-line LCD with backlight",
      "Communication": "Modbus RTU/TCP, PROFIBUS DP",
      "Digital Inputs": "4",
      "Digital Outputs": "2",
      "Analog Outputs": "2",
      "Power Supply": "100-240V AC/DC",
      "Dimensions": "96 x 96 x 75 mm",
      "Weight": "350 g"
    },
    features: [
      "High measurement accuracy (Class 0.2S)",
      "Comprehensive power quality analysis",
      "Harmonic analysis up to 63rd order",
      "Data logging and trending",
      "Alarm and event management",
      "Web server interface",
      "Multiple communication protocols",
      "Compact panel mount design"
    ],
    images: [
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fbd445c4cd3a?w=800&h=600&fit=crop"
    ],
    rating: 4.6,
    reviewCount: 15,
    datasheet: "/datasheets/sentron-pac4200.pdf"
  },
  {
    id: 4,
    name: "LOGO! 8 Controller",
    brand: "Siemens",
    model: "6ED1052-1MD08-0BA1",
    price: 8750000,
    sku: "LOG-8-MD08",
    inStock: false,
    stockQuantity: 0,
    category: "Logic Controllers",
    summary: "Compact intelligent logic module for simple automation tasks",
    description: `The LOGO! 8 Logic Module is a compact and versatile programmable logic controller designed for simple automation applications. With its user-friendly programming interface and built-in functions, it provides an cost-effective solution for basic control tasks.

This logic module features a clear display, integrated real-time clock, and expandable I/O capabilities. The intuitive LOGO!Soft Comfort programming software makes it easy to create and modify control programs.

Perfect for building automation, small machinery control, and simple process automation where space and cost are important considerations.`,
    specifications: {
      "Power Supply": "12/24V DC",
      "Digital Inputs": "8",
      "Digital Outputs": "4 relay outputs",
      "Analog Inputs": "4 (0-10V)",
      "Memory": "400 blocks",
      "Display": "6-line text display",
      "Communication": "Ethernet interface",
      "Real-time Clock": "Integrated",
      "Dimensions": "90 x 71.5 x 60 mm",
      "Weight": "300 g",
      "Operating Temperature": "0°C to +55°C",
      "Certification": "CE, UL, CSA"
    },
    features: [
      "Compact design saves space",
      "Intuitive programming with LOGO!Soft",
      "Integrated display and operating keys",
      "Real-time clock for time functions",
      "Expandable with additional modules",
      "Ethernet connectivity",
      "Web server functionality",
      "Energy-efficient operation"
    ],
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.9,
    reviewCount: 32,
    datasheet: "/datasheets/logo-8.pdf"
  },
  {
    id: 5,
    name: "SITOP Power Supply",
    brand: "Siemens",
    model: "6EP1334-3BA10",
    price: 15250000,
    sku: "SIT-PSU100D-BA10",
    inStock: true,
    stockQuantity: 20,
    category: "Power Supplies",
    summary: "Reliable DC power supply for industrial automation systems",
    description: `The SITOP Power Supply PSU100D is a highly efficient and reliable DC power supply designed for industrial automation applications. With its robust design and advanced protection features, it ensures stable power delivery for critical control systems.

This power supply features wide input voltage range, high efficiency, and comprehensive diagnostic capabilities. The compact design and easy installation make it ideal for control cabinet mounting.

Perfect for powering PLCs, I/O modules, and other automation devices where reliable power supply is essential for system operation.`,
    specifications: {
      "Input Voltage": "120-230V AC",
      "Output Voltage": "24V DC",
      "Output Current": "10A",
      "Output Power": "240W",
      "Efficiency": "> 93%",
      "Input Frequency": "47-63 Hz",
      "Protection": "Short circuit, overload, overvoltage",
      "Indicators": "LED status indicators",
      "Dimensions": "125 x 125 x 100 mm",
      "Weight": "850 g",
      "Operating Temperature": "-25°C to +70°C",
      "Certification": "CE, UL, CSA, ATEX"
    },
    features: [
      "High efficiency > 93%",
      "Wide input voltage range",
      "Comprehensive protection functions",
      "LED status indicators",
      "Compact DIN rail mounting",
      "Low ripple and noise",
      "Parallel operation capability",
      "ATEX certification available"
    ],
    images: [
      "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.5,
    reviewCount: 12,
    datasheet: "/datasheets/sitop-psu100d.pdf"
  },
  {
    id: 6,
    name: "SIRIUS Motor Starter",
    brand: "Siemens",
    model: "3RM1207-1AA04",
    price: 22100000,
    sku: "SIR-3RM1-AA04",
    inStock: true,
    stockQuantity: 10,
    category: "Motor Control",
    summary: "Advanced motor starter with integrated protection and monitoring",
    description: `The SIRIUS Motor Starter 3RM1 is a sophisticated motor starting and protection device designed for demanding industrial applications. With its integrated monitoring and diagnostic capabilities, it provides comprehensive motor protection and control.

This motor starter features adjustable parameters, communication interfaces, and energy monitoring functions. The compact design and easy commissioning make it ideal for modern motor control applications.

Perfect for pumps, compressors, and general motor applications where advanced protection and monitoring are required.`,
    specifications: {
      "Motor Power": "0.09 kW to 90 kW",
      "Voltage Range": "200V - 690V AC",
      "Starting Current": "12 x rated current",
      "Protection Class": "Class 10A",
      "Communication": "IO-Link, PROFINET",
      "Temperature Monitoring": "PTC/PT100 input",
      "Display": "LED status indicators",
      "Mounting": "DIN rail or panel mount",
      "Dimensions": "45 x 84 x 91 mm",
      "Weight": "280 g",
      "Operating Temperature": "-25°C to +60°C",
      "Certification": "CE, UL, CSA, IECEx"
    },
    features: [
      "Integrated motor protection",
      "Energy monitoring functions",
      "IO-Link and PROFINET connectivity",
      "Adjustable protection parameters",
      "Temperature monitoring input",
      "Diagnostic and maintenance data",
      "Compact modular design",
      "Easy commissioning"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092787765-e3d76c2d9826?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.7,
    reviewCount: 20,
    datasheet: "/datasheets/sirius-3rm1.pdf"
  },
  {
    id: 7,
    name: "SCALANCE Switch",
    brand: "Siemens",
    model: "6GK5204-2BC00-2AF2",
    price: 18600000,
    sku: "SCA-X204-BC00",
    inStock: true,
    stockQuantity: 6,
    category: "Networking",
    summary: "Industrial Ethernet switch for reliable network communication",
    description: `The SCALANCE X204-2 Switch is a robust industrial Ethernet switch designed for reliable network communication in harsh industrial environments. With its compact design and advanced features, it ensures stable data transmission for automation networks.

This Ethernet switch features auto-negotiation, auto-crossing, and comprehensive diagnostic capabilities. The metal housing and wide temperature range make it suitable for industrial applications.

Perfect for connecting automation devices, HMIs, and other network components where reliable Ethernet communication is essential.`,
    specifications: {
      "Port Configuration": "4 x 10/100 Mbps + 2 x 100 Mbps fiber",
      "Switching Method": "Store and forward",
      "Auto Negotiation": "10/100 Mbps full/half duplex",
      "Auto Crossing": "Auto MDI/MDIX",
      "MAC Address Table": "1024 entries",
      "Power Supply": "24V DC",
      "Power Consumption": "8W max",
      "Protection Class": "IP30",
      "Dimensions": "160 x 125 x 32 mm",
      "Weight": "520 g",
      "Operating Temperature": "-40°C to +70°C",
      "Certification": "CE, UL, CSA, C-TICK"
    },
    features: [
      "Industrial design for harsh environments",
      "Auto-negotiation and auto-crossing",
      "Fiber optic connectivity options",
      "Comprehensive LED diagnostics",
      "DIN rail or wall mounting",
      "Wide operating temperature range",
      "No configuration required",
      "PROFINET RT support"
    ],
    images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.4,
    reviewCount: 8,
    datasheet: "/datasheets/scalance-x204.pdf"
  },
  {
    id: 8,
    name: "SIVACON Panel",
    brand: "Siemens",
    model: "8PQ50",
    price: 67500000,
    originalPrice: 75000000,
    sku: "SIV-S8-PQ50",
    inStock: true,
    stockQuantity: 3,
    category: "Panel Systems",
    summary: "Modular low-voltage switchgear and controlgear assemblies",
    description: `The SIVACON S8 Panel System is a comprehensive low-voltage switchgear solution designed for industrial and commercial applications. With its modular design and flexible configuration options, it provides reliable power distribution and motor control.

This panel system features standardized components, easy assembly, and comprehensive testing procedures. The robust construction and high-quality materials ensure long-term reliability and safety.

Perfect for power distribution, motor control centers, and automation panels where flexibility and reliability are essential requirements.`,
    specifications: {
      "Rated Voltage": "690V AC",
      "Rated Current": "up to 6300A",
      "Short Circuit Rating": "up to 150 kA",
      "Protection Class": "IP54",
      "Form of Separation": "Form 4b",
      "Frame Height": "2200 mm",
      "Frame Width": "600/800 mm",
      "Frame Depth": "400/600 mm",
      "Construction": "Steel sheet, powder coated",
      "Busbar System": "Copper, silver plated",
      "Operating Temperature": "-5°C to +40°C",
      "Certification": "IEC 61439, CE, UL"
    },
    features: [
      "Modular system design",
      "High short-circuit rating",
      "Flexible configuration options",
      "Standardized components",
      "Easy assembly and maintenance",
      "Comprehensive type testing",
      "Arc fault protection available",
      "Global approvals and certifications"
    ],
    images: [
      "https://images.unsplash.com/photo-1581091878368-de3e48b79efc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.8,
    reviewCount: 14,
    datasheet: "/datasheets/sivacon-s8.pdf"
  },
  {
    id: 9,
    name: "WinCC SCADA Software",
    brand: "Siemens",
    model: "6AV2107-0FA00-0AA0",
    price: 35800000,
    sku: "WIN-SCADA-V17",
    inStock: true,
    stockQuantity: 25,
    category: "SCADA Software",
    summary: "Professional SCADA software for industrial automation and visualization",
    description: `WinCC SCADA Software V17 is a comprehensive supervisory control and data acquisition system designed for industrial automation applications. With its powerful visualization capabilities and extensive functionality, it provides complete plant monitoring and control.

This SCADA software features intuitive engineering tools, scalable architecture, and integrated reporting functions. The web-based clients and mobile access enable flexible operation from anywhere.

Perfect for manufacturing plants, process industries, and building automation where comprehensive monitoring and control capabilities are required.`,
    specifications: {
      "System Requirements": "Windows 10/Server 2019",
      "Database": "SQL Server or WinCC Database",
      "Max Tags": "unlimited",
      "Max Clients": "unlimited",
      "Communication": "OPC UA, PROFINET, Ethernet",
      "Redundancy": "Server and network redundancy",
      "Archives": "Process and alarm archives",
      "Reporting": "Built-in report designer",
      "Languages": "Multi-language support",
      "Security": "User management and access control",
      "APIs": "VBA, VBS, C++, .NET",
      "Certification": "IEC 62443 cyber security"
    },
    features: [
      "Intuitive engineering environment",
      "Scalable system architecture",
      "Web-based visualization clients",
      "Mobile device support",
      "Integrated alarm management",
      "Historical data archiving",
      "Advanced reporting functions",
      "OPC UA connectivity"
    ],
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.6,
    reviewCount: 22,
    datasheet: "/datasheets/wincc-v17.pdf"
  },
  {
    id: 10,
    name: "G-Comin Relay Module",
    brand: "G-Comin",
    model: "GRM-24-DC24V",
    price: 5450000,
    sku: "GCO-GRM24-DC24",
    inStock: true,
    stockQuantity: 30,
    category: "Interface Modules",
    summary: "Industrial relay module for signal isolation and switching",
    description: `The G-Comin Relay Module GRM-24 is a versatile interface relay designed for signal isolation and switching applications in industrial automation systems. With its compact design and reliable operation, it provides effective galvanic isolation between control and load circuits.

This relay module features LED status indicators, screw terminals, and DIN rail mounting. The robust construction and high switching capacity make it suitable for various industrial applications.

Perfect for PLC interfacing, motor control, and general switching applications where reliable signal isolation is required.`,
    specifications: {
      "Coil Voltage": "24V DC",
      "Contact Configuration": "1NO + 1NC",
      "Switching Voltage": "250V AC / 30V DC",
      "Switching Current": "8A AC / 5A DC",
      "Contact Material": "AgCdO",
      "Operating Life": "10 million operations",
      "Response Time": "10 ms max",
      "LED Indicators": "Coil status indication",
      "Dimensions": "22.5 x 75 x 100 mm",
      "Weight": "120 g",
      "Operating Temperature": "-40°C to +55°C",
      "Certification": "CE, UL, CSA"
    },
    features: [
      "Compact DIN rail mounting",
      "LED status indication",
      "High switching capacity",
      "Galvanic isolation",
      "Screw terminal connections",
      "Wide operating temperature range",
      "Long electrical life",
      "UL recognized components"
    ],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.3,
    reviewCount: 16,
    datasheet: "/datasheets/g-comin-grm24.pdf"
  },
  {
    id: 11,
    name: "G-Comin Contactor",
    brand: "G-Comin",
    model: "GCT-40-AC24V",
    price: 12750000,
    sku: "GCO-GCT40-AC24",
    inStock: true,
    stockQuantity: 18,
    category: "Contactors",
    summary: "Heavy-duty contactor for motor control and power switching",
    description: `The G-Comin Contactor GCT-40 is a robust electromechanical contactor designed for heavy-duty motor control and power switching applications. With its high breaking capacity and reliable operation, it ensures safe and efficient control of electrical loads.

This contactor features silver alloy contacts, auxiliary contacts, and coil surge suppression. The compact design and standard mounting dimensions make it compatible with most control panels.

Perfect for motor starting, heating control, and general power switching where reliable and safe operation is essential.`,
    specifications: {
      "Rated Current": "40A",
      "Coil Voltage": "24V AC",
      "Contact Configuration": "3NO + 1NO auxiliary",
      "Switching Voltage": "690V AC",
      "Motor Power": "18.5 kW at 400V",
      "Contact Material": "Silver alloy",
      "Operating Life": "5 million operations",
      "Coil Power": "3.5 VA",
      "Dimensions": "45 x 75 x 85 mm",
      "Weight": "350 g",
      "Operating Temperature": "-25°C to +60°C",
      "Certification": "CE, UL, CSA, CCC"
    },
    features: [
      "High breaking capacity",
      "Silver alloy contacts",
      "Auxiliary contact included",
      "Coil surge suppression",
      "Standard mounting dimensions",
      "Wide coil voltage range",
      "High mechanical life",
      "Global certifications"
    ],
    images: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.5,
    reviewCount: 19,
    datasheet: "/datasheets/g-comin-gct40.pdf"
  },
  {
    id: 12,
    name: "G-Comin Circuit Breaker",
    brand: "G-Comin",
    model: "GCB-63-C16",
    price: 9800000,
    sku: "GCO-GCB63-C16",
    inStock: false,
    stockQuantity: 0,
    category: "Circuit Protection",
    summary: "Miniature circuit breaker for overcurrent protection",
    description: `The G-Comin Circuit Breaker GCB-63 is a high-quality miniature circuit breaker designed for overcurrent protection in industrial and commercial electrical installations. With its reliable trip mechanism and compact design, it provides effective protection against overload and short circuit conditions.

This circuit breaker features thermal-magnetic trip technology, high breaking capacity, and visual trip indication. The modular design allows for easy installation in standard distribution boards.

Perfect for motor protection, lighting circuits, and general overcurrent protection where reliable and selective protection is required.`,
    specifications: {
      "Rated Current": "16A",
      "Trip Characteristic": "Type C",
      "Breaking Capacity": "6 kA",
      "Rated Voltage": "230/400V AC",
      "Frequency": "50/60 Hz",
      "Trip Technology": "Thermal-magnetic",
      "Number of Poles": "1 pole",
      "Mounting": "DIN rail 35mm",
      "Dimensions": "18 x 85 x 78 mm",
      "Weight": "150 g",
      "Operating Temperature": "-25°C to +60°C",
      "Certification": "CE, IEC 60898"
    },
    features: [
      "Thermal-magnetic trip technology",
      "High breaking capacity",
      "Visual trip indication",
      "Modular DIN rail mounting",
      "Compact design",
      "Reliable overcurrent protection",
      "Easy installation",
      "IEC 60898 compliant"
    ],
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    rating: 4.4,
    reviewCount: 11,
    datasheet: "/datasheets/g-comin-gcb63.pdf"
  }
];

// Sample reviews data
const reviews: Review[] = [
  {
    id: 1,
    userName: "Ahmad Wijaya",
    rating: 5,
    date: "2024-01-15",
    title: "Excellent PLC for Complex Applications",
    comment: "We've been using this S7-1500 CPU in our automotive production line for 6 months now. The performance is outstanding, and the programming with TIA Portal is very intuitive. Highly recommended for demanding applications.",
    verified: true,
    helpful: 12
  },
  {
    id: 2,
    userName: "Siti Nurhaliza",
    rating: 4,
    date: "2024-01-10",
    title: "Great Performance, Fast Delivery",
    comment: "Fast processing speed and reliable operation. Hokiindo Raya provided excellent technical support during installation. The integrated PROFINET interface works perfectly with our distributed I/O.",
    verified: true,
    helpful: 8
  },
  {
    id: 3,
    userName: "Bambang Sutrisno",
    rating: 5,
    date: "2024-01-05",
    title: "Perfect for Our Food Processing Plant",
    comment: "Implemented this CPU in our food processing automation system. The fail-safe capabilities and robust design make it perfect for our harsh industrial environment.",
    verified: true,
    helpful: 15
  }
];

const relatedProducts = [
  {
    id: 3,
    name: "SENTRON PAC Meter",
    price: 28900000,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    name: "LOGO! 8 Controller",
    price: 8750000,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    name: "SITOP Power Supply",
    price: 15250000,
    image: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=400&h=300&fit=crop"
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  });

  useEffect(() => {
    const foundProduct = products.find(p => p.id === productId);
    setProduct(foundProduct || null);
  }, [productId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (isAutoPlay && product && product.images.length > 1) {
      slideIntervalRef.current = setInterval(() => {
        setSelectedImageIndex(prev => 
          prev === product.images.length - 1 ? 0 : prev + 1
        );
      }, 4000);
    } else {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    }

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [isAutoPlay, product]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showZoom && e.key === 'Escape') {
        setShowZoom(false);
        return;
      }
      
      if (product && product.images.length > 1) {
        if (e.key === 'ArrowLeft') {
          setSelectedImageIndex(prev => 
            prev === 0 ? product.images.length - 1 : prev - 1
          );
        } else if (e.key === 'ArrowRight') {
          setSelectedImageIndex(prev => 
            prev === product.images.length - 1 ? 0 : prev + 1
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [product, showZoom]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/products" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product.stockQuantity)));
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    alert(`${quantity} x ${product.name} berhasil ditambahkan ke keranjang!`);
  };

  const handleBuyNow = () => {
    // Buy now logic here
    alert(`Membeli ${quantity} x ${product.name} sekarang!`);
  };

  const nextImage = () => {
    setSelectedImageIndex(prev => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex(prev => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const filteredReviews = reviews.filter(review => {
    if (reviewFilter === "all") return true;
    if (reviewFilter === "verified") return review.verified;
    return review.rating === parseInt(reviewFilter);
  });

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const starSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-red-600">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-red-600">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" ref={contentRef}>
          
          {/* Enhanced Product Slideshow */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Main Slideshow Container */}
            <div className="relative mb-6">
              <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 group relative">
                {/* Main Image */}
                <img
                  src={product.images[selectedImageIndex]}
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500"
                />

                {/* Slideshow Controls */}
                {product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index === selectedImageIndex 
                              ? 'bg-white' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}

                {/* Zoom Button */}
                <button
                  onClick={() => setShowZoom(true)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-3 rounded-full transition-colors duration-200 z-10"
                  aria-label="Zoom image"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === selectedImageIndex
                      ? 'border-red-500 ring-2 ring-red-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Slideshow Controls */}
            {product.images.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isAutoPlay 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isAutoPlay ? 'Stop Auto-play' : 'Start Auto-play'}
                </button>
                <span className="text-sm text-gray-500">
                  Use ← → keys to navigate
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Product Info */}
          <div className={`transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Brand & Model */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-600 font-bold text-lg">{product.brand}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 font-medium">{product.model}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-6">
              {renderStars(product.rating, "lg")}
              <span className="text-gray-600 font-medium">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-red-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                      Hemat {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Harga belum termasuk PPN 11%</p>
            </div>

            {/* Product Summary */}
            <div className="mb-6">
              <p className="text-gray-700 text-lg leading-relaxed">{product.summary}</p>
            </div>

            {/* Stock & SKU */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">Tersedia</span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-semibold">Stok Habis</span>
                  </>
                )}
              </div>
              <div className="text-right">
                <span className="text-gray-600">Stok: </span>
                <span className="font-semibold text-gray-900">{product.stockQuantity} unit</span>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-gray-600">SKU: </span>
              <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
            </div>

            {/* Enhanced Quantity & Purchase Controls */}
            <div className="space-y-6 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Jumlah:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 min-w-[80px] text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Total: <span className="font-semibold text-red-600">{formatPrice(product.price * quantity)}</span>
                </span>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {product.inStock ? 'Tambah ke Keranjang' : 'Stok Habis'}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Beli Sekarang
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 p-4 border-2 border-gray-300 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      isWishlisted 
                        ? 'bg-red-50 text-red-600 border-red-300' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    <span className="font-medium">{isWishlisted ? 'Favorit' : 'Tambah ke Favorit'}</span>
                  </button>

                  <button className="p-4 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Features */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-600" />
                Fitur Unggulan
              </h3>
              <ul className="space-y-3">
                {product.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Truck className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">Pengiriman Cepat</div>
                <div className="text-xs text-gray-600">1-2 hari kerja</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Shield className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">Garansi Resmi</div>
                <div className="text-xs text-gray-600">2 tahun</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <Settings className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">Dukungan Teknis</div>
                <div className="text-xs text-gray-600">24/7 support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="max-w-4xl">
                <div className="prose prose-gray max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* All Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Feature List</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Datasheet */}
                {product.datasheet && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Documentation</h4>
                    <p className="text-gray-600 mb-4">Download the complete technical datasheet for detailed specifications and installation guidelines.</p>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Datasheet (PDF)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specifications" && (
              <div className="max-w-4xl">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <div key={index} className="px-6 py-4 flex items-center justify-between">
                        <span className="font-medium text-gray-900">{key}</span>
                        <span className="text-gray-700 font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="max-w-4xl">
                {/* Review Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
                      <div className="flex items-center gap-4">
                        {renderStars(product.rating, "lg")}
                        <span className="text-2xl font-bold text-gray-900">{product.rating}</span>
                        <span className="text-gray-600">({product.reviewCount} reviews)</span>
                      </div>
                    </div>
                    
                    {/* Review Filter */}
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">All Reviews</option>
                      <option value="verified">Verified Only</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-semibold">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{review.userName}</span>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating, "sm")}
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <button className="flex items-center gap-1 hover:text-red-600 transition-colors duration-200">
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showZoom && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setShowZoom(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img
              src={product.images[selectedImageIndex]}
              alt={`${product.name} - Zoomed view ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Enhanced Navigation arrows for zoom modal */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-colors duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-colors duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Image counter in zoom modal */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex + 1} dari {product.images.length}
                </div>

                {/* Dot indicators in zoom modal */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === selectedImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Close instruction */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-full text-sm">
              Tekan ESC untuk menutup
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 