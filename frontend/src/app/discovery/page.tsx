'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Search, 
  Plus, 
  Globe, 
  Building2, 
  Star, 
  Check, 
  Loader2, 
  Send, 
  Database,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DiscoveryPage() {
  const [rawData, setRawData] = useState('');
  const [discoveredCompanies, setDiscoveredCompanies] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      alert('Intelligence synced! Background enrichment started.');
    } catch (err) {
      alert('Failed to save companies.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100">
            <Zap size={32} fill="currentColor" />
          </div>
          Intelligence Discovery
        </h1>
        <p className="text-lg text-gray-500 font-medium mt-3">Feed raw source data to the engine for automated company extraction and scoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Source Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden group focus-within:border-blue-400 transition-all duration-500">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Raw Input Feed</span>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse delay-75"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-100 animate-pulse delay-150"></div>
              </div>
            </div>
            <textarea
              className="w-full h-[500px] p-8 text-sm font-mono outline-none resize-none border-none bg-white placeholder:text-gray-300"
              placeholder="Dump LinkedIn snippets, startup directories, or job board listings here..."
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
            />
            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
               <button
                onClick={handleAIDiscovery}
                disabled={isProcessing || !rawData.trim()}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-[20px] font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} fill="currentColor" />}
                Run AI Extraction
              </button>
            </div>
          </div>
        </div>

        {/* Intelligence Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Intelligence Preview</h2>
            {discoveredCompanies.length > 0 && (
              <button 
                onClick={handleBulkSave}
                disabled={isSaving}
                className="text-xs font-black text-blue-600 flex items-center gap-2 hover:translate-x-2 transition-transform"
              >
                Sync to Engine <ArrowRight size={16} />
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[700px] overflow-auto pr-2 custom-scrollbar">
            {discoveredCompanies.length === 0 ? (
              <div className="h-[600px] flex flex-col items-center justify-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200 text-gray-300">
                 <Database size={64} className="mb-4 opacity-20" />
                 <p className="text-sm font-bold uppercase tracking-widest">Awaiting source data...</p>
              </div>
            ) : (
              discoveredCompanies.map((c, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:border-blue-200 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {c.companyName[0]}
                         </div>
                         <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">{c.companyName}</h3>
                            <p className="text-xs text-blue-500 font-bold uppercase tracking-tighter">{c.domain}</p>
                         </div>
                      </div>
                      <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black border border-orange-100 flex items-center gap-1">
                         <Star size={14} fill="currentColor" /> {c.score}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Industry</p>
                         <p className="text-xs font-bold text-gray-700">{c.industry}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Signal</p>
                         <p className="text-xs font-bold text-gray-700 truncate">{c.hiringSignal}</p>
                      </div>
                   </div>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{c.description}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
