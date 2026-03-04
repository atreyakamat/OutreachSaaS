'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Globe, 
  MapPin, 
  Star,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyDirectoryPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [industryFilter]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies', {
        params: { industry: industryFilter }
      });
      setCompanies(response.data);
    } catch (err) {
      console.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.domain?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading directory...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-600" /> Company Directory
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage your global employer database.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/discovery"
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-100 transition border border-blue-100 shadow-sm"
          >
            <TrendingUp size={18} /> Run Discovery
          </Link>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            <Plus size={18} /> Add Company
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by company name or domain..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="pl-11 pr-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                <option value="">All Industries</option>
                <option value="Tech">Tech</option>
                <option value="SaaS">SaaS</option>
                <option value="Marketing">Marketing</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Company</th>
                <th className="px-6 py-5">Industry / Location</th>
                <th className="px-6 py-5">Size</th>
                <th className="px-6 py-5">Score</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-blue-50/30 transition group">
                  <td className="px-8 py-6">
                    <Link href={`/companies/${company.id}`} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        {company.companyName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {company.companyName}
                        </p>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <Globe size={10} /> {company.domain}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs font-bold text-gray-700">{company.industry || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                      <MapPin size={10} /> {company.city}, {company.country}
                    </p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded-lg uppercase">
                      {company.companySize || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1.5 text-orange-600 font-black text-sm">
                      <Star size={14} fill={company.score >= 5 ? "currentColor" : "none"} />
                      {company.score}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      company.status === 'ENRICHED' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/companies/${company.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
