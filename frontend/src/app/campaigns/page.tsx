'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Play, Info } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Campaign Form
  const [name, setName] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data);
    } catch (err) {
      console.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', { name, subjectTemplate, bodyTemplate });
      setName('');
      setSubjectTemplate('');
      setBodyTemplate('');
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      alert('Failed to create campaign');
    }
  };

  const handleStartCampaign = async (id: string) => {
    try {
      await api.post(`/campaigns/${id}/start`);
      fetchCampaigns();
      alert('Campaign started! Emails are being scheduled.');
    } catch (err) {
      alert('Failed to start campaign');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading campaigns...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500">Create and monitor your outreach campaigns</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            No campaigns yet. Click "New Campaign" to start.
          </div>
        ) : (
          campaigns.map((campaign: any) => (
            <div key={campaign.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                Subject: {campaign.subjectTemplate}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                {campaign.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStartCampaign(campaign.id)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    <Play size={16} fill="currentColor" /> Start
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">New Campaign</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Q1 Global Outreach"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Template</label>
                <input
                  type="text"
                  value={subjectTemplate}
                  onChange={(e) => setSubjectTemplate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Hello {{ contactName }} from {{ companyName }}"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Template (HTML or Plain Text)</label>
                <textarea
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm"
                  placeholder="Hi {{ contactName }},

I noticed {{ companyName }} is doing great things..."
                  required
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Use placeholders like <code>{`{{ contactName }}`}</code> and <code>{`{{ companyName }}`}</code> to personalize your emails. Emails will be automatically scheduled for 10 AM in each recipient's timezone.
                </p>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
