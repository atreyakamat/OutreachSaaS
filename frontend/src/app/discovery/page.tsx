'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search, Plus, Globe, Building2, Star, Check, Loader2, Send, Database } from 'lucide-react';

export default function DiscoveryPage() {
  const [rawData, setRawData] = useState('');
  const [discoveredCompanies, setDiscoveredCompanies] = useState<any[]>([]);
  const [existingCompanies, setExistingCompanies] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setExistingCompanies(response.data);
    } catch (err) {
      console.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleAIDiscovery = async () => {
    if (!rawData.trim()) return;
    setIsProcessing(true);
    try {
      const response = await api.post('/ai/discover', { rawData });
      setDiscoveredCompanies(response.data);
    } catch (err) {
      alert('AI Discovery failed. Ensure Ollama is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSave = async () => {
    if (discoveredCompanies.length === 0) return;
    setIsSaving(true);
    try {
      await api.post('/ai/bulk-save-companies', { companies: discoveredCompanies });
      setDiscoveredCompanies([]);
      setRawData('');
      fetchCompanies();
      alert('Companies successfully added to your database!');
    } catch (err) {
      alert('Failed to save companies.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Employer Database...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Globe className="text-blue-600" /> Company Discovery Hub
          </h1>
          <p className="text-sm text-gray-500">Find and score potential employers continuously.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discovery Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Raw Source Feed</span>
              <button
                onClick={handleAIDiscovery}
                disabled={isProcessing || !rawData.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                Extract Companies
              </button>
            </div>
            <textarea
              className="w-full h-96 p-4 text-sm font-mono outline-none resize-none border-none"
              placeholder="Paste LinkedIn lists, startup directories, or news snippets..."
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
            />
          </div>

          {discoveredCompanies.length > 0 && (
            <button
              onClick={handleBulkSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white p-4 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
              Save {discoveredCompanies.length} Companies to DB
            </button>
          )}
        </div>

        {/* Discovery Preview / List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              {discoveredCompanies.length > 0 ? 'AI Extraction Preview' : 'Employer Database'}
            </h2>
            <div className="flex gap-2">
               <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100">
                 <Database size={12} /> {existingCompanies.length} Companies
               </div>
            </div>
          </div>

          <div className="space-y-4">
            {(discoveredCompanies.length > 0 ? discoveredCompanies : existingCompanies).map((company, idx) => (
              <div key={company.id || idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-blue-200 transition group">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {company.name}
                        {company.score >= 5 && (
                          <span className="bg-orange-50 text-orange-600 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-orange-100 flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> High Match
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">{company.domain} • {company.industry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">
                      Score: {company.score}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">{company.city}, {company.country}</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hiring Signal</p>
                    <p className="text-xs font-medium text-gray-700">{company.hiringSignal || 'Unknown'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Company Size</p>
                    <p className="text-xs font-medium text-gray-700">{company.sizeRange || 'Unknown'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                   <p className="text-xs text-gray-500 italic line-clamp-1 flex-1 pr-4">{company.description}</p>
                   <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700">
                     Find Decision Makers <Send size={14} />
                   </button>
                </div>
              </div>
            ))}

            {discoveredCompanies.length === 0 && existingCompanies.length === 0 && (
              <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                <Globe size={64} className="mx-auto mb-4 opacity-10" />
                <p className="text-sm font-medium">Your employer database is empty. Feed the source to start discovery.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
