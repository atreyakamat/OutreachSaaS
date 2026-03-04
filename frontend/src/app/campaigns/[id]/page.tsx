'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Mail, 
  Sparkles, 
  Info, 
  ChevronRight,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function TemplateBuilderPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);

  // New Template Form
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await api.get('/campaigns');
      const data = response.data.find((c: any) => c.id === id);
      if (data) {
        setCampaign(data);
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to fetch campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(`/campaigns/${id}/templates`, { name, subject, body });
      setTemplates([...templates, response.data]);
      setName('');
      setSubject('');
      setBody('');
    } catch (err) {
      alert('Failed to add template');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading campaign architect...</div>;
  if (!campaign) return <div className="p-8 text-center text-red-500">Campaign sequence not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <Link href="/campaigns" className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-purple-600 transition shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{campaign.name}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Design multi-touch sequence architecture.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Template List */}
        <div className="lg:col-span-2 space-y-8">
           <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 px-2">Sequence Timeline</h2>
           <div className="space-y-6 relative">
              {templates.length === 0 ? (
                <div className="py-24 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200 text-gray-300">
                   <Mail size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="text-sm font-bold uppercase tracking-widest">Awaiting touchpoints...</p>
                </div>
              ) : (
                templates.map((template, idx) => (
                  <div key={template.id} className="relative pl-12">
                     <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-purple-100 z-10">
                        {idx + 1}
                     </div>
                     {idx !== templates.length - 1 && (
                       <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-purple-100"></div>
                     )}
                     
                     <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:border-purple-200 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <h3 className="text-lg font-black text-gray-900">{template.name}</h3>
                              <p className="text-xs text-purple-600 font-bold mt-1 uppercase tracking-tighter">Subject: {template.subject}</p>
                           </div>
                           <button className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                           </button>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100/50">
                           <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                              {template.body}
                           </p>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Builder Sidebar */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-purple-50 border border-purple-100 sticky top-24">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                 <Sparkles size={24} className="text-purple-600" /> New Touchpoint
              </h2>
              <form onSubmit={handleAddTemplate} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Template Label</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-purple-400 transition-all outline-none"
                      placeholder="e.g. Intro Email"
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-purple-400 transition-all outline-none"
                      placeholder="e.g. Question about {{company_name}}"
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Message Body</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full h-64 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-purple-400 transition-all outline-none resize-none leading-relaxed"
                      placeholder="Hi {{contact_name}}, I noticed your work in {{industry}}..."
                      required
                    />
                 </div>
                 
                 <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">
                       <Info size={12} /> Variable Logic
                    </div>
                    <p className="text-[10px] text-purple-400 font-bold leading-relaxed">
                       Available: <code className="text-purple-600">{`{{company_name}}`}</code>, <code className="text-purple-600">{`{{contact_name}}`}</code>, <code className="text-purple-600">{`{{industry}}`}</code>.
                    </p>
                 </div>

                 <button
                   type="submit"
                   className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-100 flex items-center justify-center gap-2"
                 >
                   Deploy to Sequence <Plus size={18} />
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}
