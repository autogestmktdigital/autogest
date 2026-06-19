'use client';

import { Bell, Menu, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuToggle: () => void;
}

export function Header({ title, breadcrumb, onMenuToggle }: HeaderProps) {
  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          {breadcrumb && (
            <p className="text-xs text-gray-500">{breadcrumb}</p>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 cursor-pointer">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
          {user.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
        </div>
      </div>
    </header>
  );
}
