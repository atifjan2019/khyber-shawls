"use client";

import { Package, Tags, Images, FileText, ShoppingCart, MessageSquare, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const ADMIN_MENU_ITEMS = [
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/media', label: 'Media', icon: Images },
  { href: '/admin/journal', label: 'Blogs', icon: FileText },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
      >
        <span>Admin Menu</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-56 rounded-lg border bg-white p-2 shadow-lg">
            {ADMIN_MENU_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}