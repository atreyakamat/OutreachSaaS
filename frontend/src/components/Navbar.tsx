'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Building2, 
  LayoutDashboard, 
  Globe, 
  ClipboardList, 
  Bell, 
  BarChart3 
} from 'lucide-react';

const Navbar = () => {
  const { logout, user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between fixed w-full z-50 shadow-sm backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-10">
        <Link href="/dashboard" className="text-2xl font-black text-blue-600 tracking-tighter hover:scale-105 transition-transform">
          ENGINE
        </Link>
        <div className="hidden lg:flex gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link href="/discovery" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
            <Globe size={16} /> Discovery
          </Link>
          <Link href="/companies" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
            <Building2 size={16} /> Directory
          </Link>
          <Link href="/pipeline" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
            <ClipboardList size={16} /> Pipeline
          </Link>
          <Link href="/reminders" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
            <Bell size={16} /> Reminders
          </Link>
          <Link href="/analytics" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">
            <BarChart3 size={16} /> Analytics
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          {user.email}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
