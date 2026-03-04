'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Save, Clock, Trash2, ArrowLeft, Send, Info } from 'lucide-react';
import Link from 'next/link';

export default function SequenceBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sequence, setSequence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);

  // Add Step Form
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [waitDays, setWaitDays] = useState(0);

  useEffect(() => {
    fetchSequence();
  }, [id]);

  const fetchSequence = async () => {
    try {
      const response = await api.get('/sequences');
      const seq = response.data.find((s: any) => s.id === id);
      if (seq) {
        setSequence(seq);
        setSteps(seq.steps);
      }
    } catch (err) {
      console.error('Failed to fetch sequence');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(`/sequences/${id}/steps`, {
        subjectTemplate: subject,
        bodyTemplate: body,
        waitDays: parseInt(waitDays.toString()),
        orderIndex: steps.length,
      });
      setSteps([...steps, response.data]);
      setSubject('');
      setBody('');
      setWaitDays(0);
    } catch (err) {
      alert('Failed to add step');
    }
  };

  const handleEnrollAllLeads = async () => {
    if (!confirm('Are you sure you want to enroll ALL active leads into this sequence?')) return;
    try {
      const leadsResponse = await api.get('/leads');
      const leadIds = leadsResponse.data.map((l: any) => l.id);
      await api.post(`/sequences/${id}/enroll`, { leadIds });
      alert('Leads enrolled successfully!');
    } catch (err) {
      alert('Failed to enroll leads');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading builder...</div>;
  if (!sequence) return <div className="p-8 text-center text-red-500">Sequence not found</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/sequences" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{sequence.name}</h1>
          <p className="text-sm text-gray-500">Sequence Builder & Orchestration</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button 
            onClick={handleEnrollAllLeads}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition shadow-sm"
          >
            <Send size={18} /> Enroll Active Leads
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Timeline</h2>
          <div className="relative space-y-8">
             {steps.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
                  <p className="text-sm font-medium">No steps added yet. Start by creating Step 1.</p>
                </div>
             )}
             {steps.map((step, idx) => (
               <div key={step.id} className="relative pl-10">
                 {/* Line */}
                 {idx !== steps.length - 1 && (
                   <div className="absolute left-[19px] top-10 bottom-[-40px] w-0.5 bg-blue-100" />
                 )}
                 {/* Number Bubble */}
                 <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200 z-10">
                   {idx + 1}
                 </div>
                 
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{step.subjectTemplate}</span>
                        {step.waitDays > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">
                            <Clock size={10} /> Wait {step.waitDays}d
                          </span>
                        )}
                      </div>
                      <button className="text-gray-300 hover:text-red-500 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-3 whitespace-pre-wrap">{step.bodyTemplate}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Add Step Sidebar */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Add Step {steps.length + 1}</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <form onSubmit={handleAddStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Hello {{ contactName }}..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Wait Interval (Days)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={waitDays}
                    onChange={(e) => setWaitDays(parseInt(e.target.value))}
                    min="0"
                    className="w-20 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                  <span className="text-sm text-gray-400 font-medium">Days after previous step</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic flex items-center gap-1">
                  <Info size={10} /> 0 days means it runs immediately after enrollment.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Email Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-48 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none font-sans"
                  placeholder="Hi {{ contactName }},

..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                <Plus size={20} /> Add Step
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
