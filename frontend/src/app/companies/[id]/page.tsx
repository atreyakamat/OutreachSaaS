'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Linkedin, 
  Plus, 
  Mail, 
  Phone, 
  Clock, 
  MessageSquare,
  Activity,
  ArrowLeft,
  Star,
  ExternalLink,
  ChevronDown,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contacts');

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const response = await api.get(`/companies/${id}`);
      setCompany(response.data);
    } catch (err) {
      console.error('Failed to fetch company');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading company intelligence...</div>;
  if (!company) return <div className="p-8 text-center text-red-500">Company not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link href="/companies" className="text-sm font-bold text-blue-600 flex items-center gap-2 mb-6 hover:translate-x-[-4px] transition-transform w-fit">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
          {/* Header */}
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-200">
              {company.companyName[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{company.companyName}</h1>
                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-black border border-orange-100">
                  <Star size={16} fill="currentColor" /> {company.score}
                </div>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-widest">
                  {company.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><Globe size={16} /> {company.domain}</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} /> {company.city}, {company.country}</span>
                <span className="flex items-center gap-1.5"><Building2 size={16} /> {company.industry}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2">
                <UserPlus size={18} /> Add Decision Maker
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">{company.description || 'No description available yet.'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hiring Signals</p>
              <p className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 inline-block">
                {company.hiringSignal || 'Scanning for signals...'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quick Stats</p>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">{company.contacts.length}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Contacts</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900">{company.activityLogs.length}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Activities</p>
                </div>
              </div>
            </div>
          </div>

          {/* BG Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-0 opacity-50 translate-x-32 -translate-y-32"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'contacts' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 border-b-4 border-transparent hover:text-gray-600'
          }`}
        >
          Decision Makers
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'activity' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 border-b-4 border-transparent hover:text-gray-600'
          }`}
        >
          Activity Log
        </button>
        <button 
          onClick={() => setActiveTab('pipeline')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'pipeline' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 border-b-4 border-transparent hover:text-gray-600'
          }`}
        >
          Pipeline History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'contacts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {company.contacts.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100 text-gray-400">
                  <UserPlus size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-bold">No decision makers added yet.</p>
                </div>
              ) : (
                company.contacts.map((contact: any) => (
                  <div key={contact.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:border-blue-200 transition group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {contact.name[0]}
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Linkedin size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1">{contact.name}</h3>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 w-fit px-2 py-0.5 rounded-full border border-blue-100">
                      {contact.role}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><Mail size={14} className="text-gray-300" /> {contact.email}</p>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><Phone size={14} className="text-gray-300" /> {contact.phone || 'N/A'}</p>
                    </div>
                    <button className="mt-6 w-full bg-gray-50 text-gray-900 py-3 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition shadow-sm flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white">
                      Start Outreach <MessageSquare size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {company.activityLogs.map((log: any) => (
                  <div key={log.id} className="p-6 hover:bg-gray-50/30 transition flex gap-4">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">{log.details}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</span>
                        {log.contact && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">{log.contact.name}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Pipeline Status
            </h2>
            <div className="space-y-4">
              {company.pipelineEntries.map((entry: any) => (
                <div key={entry.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{entry.stage}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      entry.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                  {entry.contact && (
                    <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                      <UserPlus size={12} className="text-gray-400" /> {entry.contact.name}
                    </p>
                  )}
                  {entry.nextFollowup && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 uppercase bg-orange-50 w-fit px-2 py-1 rounded-lg border border-orange-100">
                      <Clock size={12} /> Follow-up: {new Date(entry.nextFollowup).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              <button className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-400 hover:border-blue-200 hover:text-blue-600 transition">
                + New Pipeline Entry
              </button>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[32px] shadow-xl shadow-blue-100 relative overflow-hidden">
            <h2 className="text-lg font-black text-white mb-2 relative z-10">AI Insights</h2>
            <p className="text-blue-100 text-sm font-medium leading-relaxed relative z-10">
              Based on recent signals, this company is a **High Value Target**. We recommend reaching out to the Founder with a personalized intro focusing on their recent intern hiring activity.
            </p>
            <Activity size={120} className="absolute -bottom-10 -right-10 text-white/10 relative z-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
