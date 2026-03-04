'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  ClipboardList, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Building2,
  MoreVertical,
  ChevronRight,
  Plus
} from 'lucide-react';

const STAGES = [
  'discovered',
  'contact identified',
  'message sent',
  'replied',
  'demo scheduled',
  'partner onboarded'
];

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleStageUpdate = async (leadId: string, newStage: string) => {
    setUpdatingId(leadId);
    try {
      await api.patch(`/pipeline/${leadId}/stage`, { stage: newStage });
      fetchLeads();
    } catch (err) {
      alert('Failed to update stage');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Pipeline...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-blue-600" /> Employer Acquisition Pipeline
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Track decision makers from discovery to onboarding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-8">
        {STAGES.map((stage) => (
          <div key={stage} className="min-w-[250px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                {stage} 
                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[9px]">
                  {leads.filter(l => l.pipelineStage === stage).length}
                </span>
              </h2>
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-3 flex flex-col gap-3 min-h-[500px] border border-gray-100/50">
              {leads
                .filter((lead) => lead.pipelineStage === stage)
                .map((lead) => (
                  <div 
                    key={lead.id} 
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black">
                        {lead.contactName[0]}
                      </div>
                      <select
                        value={lead.pipelineStage}
                        onChange={(e) => handleStageUpdate(lead.id, e.target.value)}
                        disabled={updatingId === lead.id}
                        className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-[10px] font-bold border-none bg-gray-50 rounded px-1 py-0.5 outline-none cursor-pointer transition"
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    
                    <p className="text-sm font-black text-gray-900 leading-tight mb-1">{lead.contactName}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                      {lead.role || 'Decision Maker'}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100/50">
                      <Building2 size={12} className="text-blue-500" />
                      <span className="font-bold truncate">{lead.company.name}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                        <Clock size={10} /> 
                        {lead.lastContacted ? new Date(lead.lastContacted).toLocaleDateString() : 'No contact'}
                      </div>
                      {lead.nextFollowup && (
                        <div className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-orange-100">
                          Follow-up
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              
              {leads.filter(l => l.pipelineStage === stage).length === 0 && (
                <div className="h-full flex items-center justify-center opacity-20 py-12">
                   <Plus size={32} className="text-gray-300" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
