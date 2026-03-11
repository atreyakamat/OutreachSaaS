'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  ClipboardList, 
  MoreVertical,
  Plus,
  Filter,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const STAGES = [
  'discovered',
  'contact identified',
  'message sent',
  'replied',
  'demo scheduled',
  'partner onboarded'
];

interface PipelineEntry {
  id: string;
  stage: string;
  status: string;
  companyId: string;
  company: {
    companyName: string;
    score: number;
    industry?: string;
  };
  contact?: {
    name: string;
  };
  nextFollowup?: string;
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const response = await api.get('/pipeline');
      setPipeline(response.data);
    } catch {
      console.error('Failed to fetch pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (id: string, newStage: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/pipeline/${id}/stage`, { stage: newStage });
      fetchPipeline();
    } catch {
      alert('Failed to update stage');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your engine&apos;s pipeline...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-blue-600" /> Outreach Pipeline
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Convert discovered companies into partners.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500">
            <Filter size={16} /> Filters
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2">
            <Plus size={18} /> Add Entry
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 min-h-[calc(100vh-250px)]">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-[320px] flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                {stage} 
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-[10px]">
                  {pipeline.filter(p => p.stage === stage).length}
                </span>
              </h2>
              <button className="text-gray-300 hover:text-gray-600 transition"><MoreVertical size={16} /></button>
            </div>

            <div className="bg-gray-50/50 rounded-[32px] p-4 flex flex-col gap-4 min-h-[600px] border border-gray-100/50 backdrop-blur-sm">
              {pipeline
                .filter((p) => p.stage === stage)
                .map((entry) => (
                  <div 
                    key={entry.id} 
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center text-sm font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {entry.company.companyName[0]}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          entry.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                          {entry.status}
                        </span>
                        {entry.company.score >= 5 && <Star size={12} className="text-orange-400" fill="currentColor" />}
                      </div>
                    </div>
                    
                    <Link href={`/companies/${entry.companyId}`} className="block">
                      <h3 className="text-sm font-black text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {entry.company.companyName}
                      </h3>
                    </Link>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                      {entry.contact?.name || 'No Contact Identified'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.company.industry && (
                        <span className="text-[9px] font-bold bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md">
                          {entry.company.industry}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-white">
                           <Clock size={10} className="text-gray-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">
                          {entry.nextFollowup ? new Date(entry.nextFollowup).toLocaleDateString() : 'Set Follow-up'}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <select
                          value={entry.stage}
                          onChange={(e) => handleStageUpdate(entry.id, e.target.value)}
                          disabled={updatingId === entry.id}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        >
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
              <button className="py-4 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-blue-200 hover:text-blue-400 transition-all group">
                 <Plus size={24} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Add to stage</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
