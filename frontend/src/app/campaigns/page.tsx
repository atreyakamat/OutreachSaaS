'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { 
  Mail, 
  Plus, 
  Target, 
  Layers
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  subject?: string;
  body?: string;
}

interface Campaign {
  id: string;
  name: string;
  templates: Template[];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to fetch campaigns', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', { name: newCampaignName });
      toast.success('Campaign created successfully!');
      setNewCampaignName('');
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to create campaign', error);
      toast.error('Failed to create campaign');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading messaging engine...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-purple-600 text-white rounded-3xl shadow-xl shadow-purple-100">
              <Mail size={32} />
            </div>
            Outreach Campaigns
          </h1>
          <p className="text-lg text-gray-500 font-medium mt-3">Design personalized messaging sequences for employer partners.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-8 py-4 rounded-[24px] font-black text-sm shadow-xl shadow-purple-100 flex items-center gap-3 hover:bg-purple-700 transition-all hover:scale-105 active:scale-95"
        >
          New Campaign <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.length === 0 ? (
          <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 text-gray-300">
             <Layers size={64} className="mx-auto mb-4 opacity-20" />
             <p className="text-sm font-bold uppercase tracking-widest">No campaigns designed yet.</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-purple-50 transition-all duration-500 group">
               <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                     {campaign.name[0]}
                  </div>
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                     Ready
                  </div>
               </div>
               
               <h3 className="text-xl font-black text-gray-900 mb-2">{campaign.name}</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">{campaign.templates.length} Templates Active</p>

               <div className="space-y-3 mb-10">
                  {campaign.templates.map((t: Template, i: number) => (
                    <div key={t.id} className="flex items-center gap-3 text-sm font-medium text-gray-500">
                       <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-black border border-purple-100">
                          {i + 1}
                       </div>
                       <span className="truncate">{t.name}</span>
                    </div>
                  ))}
               </div>

               <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                  <Link 
                    href={`/campaigns/${campaign.id}`}
                    className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] hover:translate-x-2 transition-transform"
                  >
                    Edit Templates →
                  </Link>
                  <button className="p-3 text-gray-300 hover:text-purple-600 transition-colors">
                     <Target size={20} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-gray-50">
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight">Launch Campaign</h2>
                 <p className="text-sm text-gray-400 font-medium mt-1">Start a new personalized outreach sequence.</p>
              </div>
              <form onSubmit={handleCreateCampaign} className="p-10 space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Campaign Identifier</label>
                    <input
                      type="text"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-lg font-black text-gray-900 focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all placeholder:text-gray-200"
                      placeholder="e.g. Q1 Founder Outreach"
                      required
                    />
                 </div>
                 <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 rounded-3xl text-sm font-black text-gray-400 hover:bg-gray-50 transition"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 text-white py-5 rounded-3xl font-black text-sm hover:bg-purple-700 transition shadow-xl shadow-purple-100"
                    >
                      Initialize
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
