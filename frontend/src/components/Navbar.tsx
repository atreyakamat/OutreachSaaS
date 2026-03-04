'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, Mail, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { logout, user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between fixed w-full z-50">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600 tracking-tight">
          OutreachSaaS
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/discovery" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            <Users size={18} /> Discovery
          </Link>
          <Link href="/leads" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            <Users size={18} /> Leads
          </Link>
          <Link href="/sequences" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            <Mail size={18} /> Sequences
          </Link>
          <Link href="/campaigns" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            <Mail size={18} /> Campaigns
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
