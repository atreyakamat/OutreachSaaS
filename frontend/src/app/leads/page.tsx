'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Upload, Plus, Search, FileText, Brain } from 'lucide-react';
import Link from 'next/link';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (err) {
      console.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post('/leads/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchLeads();
    } catch (err) {
      alert('Failed to upload leads');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading leads...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leads Database</h1>
          <p className="text-sm text-gray-500">Manage and enrich your global contact list.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/leads/ai-import"
            className="flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-100 transition shadow-sm"
          >
            <Brain size={18} /> AI Lead Importer
          </Link>
          <label className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition shadow-sm">
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Upload CSV'}
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={uploading} />
          </label>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
            <Plus size={18} /> Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search leads by name, company, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-gray-800">Contact Name</th>
                <th className="px-6 py-4 text-gray-800">Company / Domain</th>
                <th className="px-6 py-4 text-gray-800">Email Address</th>
                <th className="px-6 py-4 text-gray-800">Location</th>
                <th className="px-6 py-4 text-gray-800">Local Timezone</th>
                <th className="px-6 py-4 text-gray-800 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <FileText size={48} />
                      <p className="text-sm font-medium">No leads found in your database.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">{lead.contactName}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{lead.companyName}</p>
                      <p className="text-xs text-blue-500">{lead.domain}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{lead.city}, {lead.country}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {lead.timezone}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
