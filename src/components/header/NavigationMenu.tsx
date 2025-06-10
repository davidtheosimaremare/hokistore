"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Store, Gift, Package } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavigationMenuProps {
  items?: NavigationItem[];
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ items }) => {
  const router = useRouter();
  
  const defaultItems: NavigationItem[] = [
    {
      label: "Jual di Hokiindo",
      href: "/seller",
      icon: <Store className="w-4 h-4" />
    },
    {
      label: "Hokiindo Reward",
      href: "/rewards",
      icon: <Gift className="w-4 h-4" />
    },
    {
      label: "Cek Pesanan",
      href: "/orders",
      icon: <Package className="w-4 h-4" />
    }
  ];

  const menuItems = items || defaultItems;

  return (
    <nav className="flex items-center space-x-6">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => router.push(item.href)}
          className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 transition-colors duration-200"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default NavigationMenu; 