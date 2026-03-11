'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Play, MoreVertical, Layout, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Step {
  id: string;
  subjectTemplate: string;
  waitDays: number;
}

interface Sequence {
  id: string;
  name: string;
  status: string;
  steps: Step[];
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      const response = await api.get('/sequences');
      setSequences(response.data);
    } catch (err) {
      console.error('Failed to fetch sequences', err);
      toast.error('Failed to load sequences');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sequences', { name: newSequenceName });
      toast.success('Sequence created successfully!');
      setNewSequenceName('');
      setShowModal(false);
      fetchSequences();
    } catch (err) {
      console.error('Failed to create sequence', err);
      toast.error('Failed to create sequence');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your sequences...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Outreach Sequences</h1>
          <p className="text-sm text-gray-500">Automate your multi-step outreach flows.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} /> New Sequence
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sequences.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            <Layout size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No sequences found. Create your first automated flow.</p>
          </div>
        ) : (
          sequences.map((seq: Sequence) => (
            <div key={seq.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{seq.name}</h3>
                  <p className="text-xs text-gray-400">{seq.steps.length} Steps</p>
                </div>
                <div className="flex gap-2">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    seq.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'
                  }`}>
                    {seq.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {seq.steps.slice(0, 3).map((step: Step, idx: number) => (
                  <div key={step.id} className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <span className="truncate flex-1">{step.subjectTemplate}</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {step.waitDays}d
                    </span>
                  </div>
                ))}
                {seq.steps.length > 3 && (
                  <p className="text-[10px] text-center text-gray-400 font-medium">+{seq.steps.length - 3} more steps</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <Link 
                  href={`/sequences/${seq.id}`}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  Edit Steps
                </Link>
                <div className="flex items-center gap-3">
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">
                    <Play size={16} fill="currentColor" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">New Sequence</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSequence} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sequence Name</label>
                <input
                  type="text"
                  value={newSequenceName}
                  onChange={(e) => setNewSequenceName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. Sales Inbound Follow-up"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size, className, onClick }: { size: number, className?: string, onClick?: () => void }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      onClick={onClick}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
