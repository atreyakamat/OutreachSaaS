'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Brain, FileText, Send, Plus, X, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProcessedLead {
  contactName: string;
  companyName: string;
  email: string;
  city: string;
  country: string;
  role: string;
  industry: string;
}

interface Tab {
  id: string;
  title: string;
  rawData: string;
  processedLeads: ProcessedLead[];
  isProcessing: boolean;
}

export default function AIImportPage() {
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Data Dump 1', rawData: '', processedLeads: [], isProcessing: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isSaving, setIsSaving] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId)!;

  const addTab = () => {
    const newId = (tabs.length + 1).toString();
    setTabs([...tabs, { id: newId, title: `Data Dump ${newId}`, rawData: '', processedLeads: [], isProcessing: false }]);
    setActiveTabId(newId);
  };

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) setActiveTabId(newTabs[0].id);
  };

  const updateActiveTab = (updates: Partial<Tab>) => {
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const handleAIProcess = async () => {
    if (!activeTab.rawData.trim()) return;
    
    updateActiveTab({ isProcessing: true });
    try {
      const response = await api.post('/ai/process', { rawData: activeTab.rawData });
      updateActiveTab({ processedLeads: response.data, isProcessing: false });
      toast.success('AI processing complete!');
    } catch (error) {
      console.error('AI processing failed', error);
      toast.error('AI processing failed. Make sure Ollama is running.');
      updateActiveTab({ isProcessing: false });
    }
  };

  const handleFinalize = async () => {
    const allLeads = tabs.flatMap(t => t.processedLeads);
    if (allLeads.length === 0) {
      toast.error('No processed leads found. Run AI processing on at least one tab.');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/ai/bulk-save', { leads: allLeads });
      toast.success('Leads saved successfully!');
      router.push('/leads');
    } catch (error) {
      console.error('Failed to save leads', error);
      toast.error('Failed to save leads.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="text-purple-600" /> AI Lead Importer
          </h1>
          <p className="text-sm text-gray-500">Dump raw text and let Ollama structure your leads.</p>
        </div>
        <button
          onClick={handleFinalize}
          disabled={isSaving}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          Finalize and Proceed
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`px-4 py-2 text-sm font-medium cursor-pointer border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTabId === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} />
            {tab.title}
            <X 
              size={14} 
              className="hover:text-red-500" 
              onClick={(e) => removeTab(tab.id, e)} 
            />
          </div>
        ))}
        <button 
          onClick={addTab}
          className="p-2 text-gray-400 hover:text-purple-600 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Side */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Raw Data Input</span>
              <button
                onClick={handleAIProcess}
                disabled={activeTab.isProcessing || !activeTab.rawData.trim()}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {activeTab.isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                Process with AI
              </button>
            </div>
            <textarea
              className="w-full h-[500px] p-4 text-sm font-mono outline-none resize-none"
              placeholder="Paste LinkedIn profiles, email signatures, or messy notes here..."
              value={activeTab.rawData}
              onChange={(e) => updateActiveTab({ rawData: e.target.value })}
            />
          </div>
        </div>

        {/* Preview Side */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Structured Preview</span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {activeTab.isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <Loader2 className="animate-spin text-purple-600" size={48} />
                <p className="text-sm font-medium">Ollama is thinking...</p>
              </div>
            ) : activeTab.processedLeads.length > 0 ? (
              <div className="space-y-3">
                {activeTab.processedLeads.map((lead, idx) => (
                  <div key={idx} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-gray-400">Name:</span> {lead.contactName}</div>
                      <div><span className="text-gray-400">Company:</span> {lead.companyName}</div>
                      <div><span className="text-gray-400">Email:</span> {lead.email}</div>
                      <div><span className="text-gray-400">Location:</span> {lead.city}, {lead.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
                <Brain size={64} />
                <p className="text-sm">Processed data will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
