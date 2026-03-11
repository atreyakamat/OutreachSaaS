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
  ArrowRight,
  RefreshCw,
  XCircle,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function DiscoveryPage() {
  const [rawData, setRawData] = useState('');
  const [discoveredCompanies, setDiscoveredCompanies] = useState<any[]>([]);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQueueLoading, setIsQueueLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'source' | 'queue'>('source');

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    setIsQueueLoading(true);
    try {
      const response = await api.get('/ai/discovered-queue');
      setReviewQueue(response.data);
    } catch (err) {
      console.error('Failed to fetch queue');
    } finally {
      setIsQueueLoading(false);
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
      fetchReviewQueue();
      alert('Discovery data synced to review queue!');
    } catch (err) {
      alert('Failed to save companies.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/ai/approve-discovered/${id}`);
      setReviewQueue(reviewQueue.filter(q => q.id !== id));
    } catch (err) {
      alert('Approval failed');
    }
  };

  const runAutomatedCrawler = async () => {
    try {
      await api.post('/ai/run-automated-discovery');
      alert('Crawler job started in background.');
    } catch (err) {
      alert('Failed to start crawler');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100">
              <Globe size={32} />
            </div>
            Discovery Hub
          </h1>
          <p className="text-lg text-gray-500 font-medium mt-3">Continuously collect and review high-value employer targets.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={runAutomatedCrawler}
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl text-sm font-black text-blue-600 border border-blue-100 shadow-sm hover:bg-blue-50 transition"
          >
            <RefreshCw size={18} /> Run Crawler
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-10 mb-8 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('source')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'source' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 border-b-4 border-transparent hover:text-gray-600'
          }`}
        >
          Source Feed
        </button>
        <button 
          onClick={() => setActiveTab('queue')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === 'queue' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 border-b-4 border-transparent hover:text-gray-600'
          }`}
        >
          Review Queue
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">{reviewQueue.length}</span>
        </button>
      </div>

      {activeTab === 'source' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  Move to Review Queue <ArrowRight size={16} />
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
                     <p className="text-sm text-gray-500 font-medium leading-relaxed italic">"{c.description}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isQueueLoading ? (
                <div className="col-span-full py-20 text-center text-gray-400">Loading queue...</div>
              ) : reviewQueue.length === 0 ? (
                <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-gray-300">
                   <ShieldCheck size={64} className="mx-auto mb-4 opacity-20" />
                   <p className="text-sm font-bold uppercase tracking-widest">Review queue is empty.</p>
                </div>
              ) : (
                reviewQueue.map((c) => (
                  <div key={c.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-3xl bg-gray-50 text-gray-400 flex items-center justify-center font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                           {c.name[0]}
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleApprove(c.id)}
                             className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                           >
                              <Check size={20} />
                           </button>
                           <button className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                              <XCircle size={20} />
                           </button>
                        </div>
                     </div>
                     <h3 className="text-xl font-black text-gray-900 mb-1">{c.name}</h3>
                     <p className="text-sm text-blue-600 font-bold mb-4 uppercase tracking-tighter">{c.domain}</p>
                     
                     <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-[10px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-lg uppercase tracking-widest border border-gray-100">{c.industry}</span>
                        <span className="text-[10px] font-black bg-blue-50 text-blue-500 px-2 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{c.source}</span>
                     </div>

                     <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                           <MapPin size={12} /> {c.city}, {c.country}
                        </div>
                        <Link href={`https://${c.domain}`} target="_blank" className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                           <ExternalLink size={16} />
                        </Link>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}
    </div>
  );
}

function ExternalLink({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
  );
}
