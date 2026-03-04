'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Users, Mail, Building2, Target, BarChart3, TrendingUp, Star, MapPin } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/stats');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Employer Intelligence...</div>;

  const stats = [
    { label: 'Companies Discovered', value: dashboardData?.stats.companies || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Decision Makers', value: dashboardData?.stats.leads || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Sequences', value: dashboardData?.stats.activeSequences || 0, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Emails Dispatched', value: dashboardData?.stats.emailsSent || 0, icon: Mail, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employer Intelligence Dashboard</h1>
          <p className="text-sm text-gray-500">Acquisition metrics for {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 flex items-center gap-2">
            <TrendingUp size={14} /> Phase 1: Local Rollout
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* High Value Targets */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Star size={18} className="text-orange-500" fill="currentColor" /> Priority Employer Targets
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Scores</span>
          </div>
          <div className="divide-y divide-gray-50">
            {dashboardData?.highValueCompanies.length > 0 ? (
              dashboardData.highValueCompanies.map((company: any) => (
                <div key={company.id} className="p-5 flex items-center justify-between hover:bg-gray-50/30 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                      {company.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{company.name}</p>
                      <p className="text-xs text-gray-500">{company.industry} • {company.sizeRange} Employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-orange-600 font-black text-sm">
                      <Star size={14} fill="currentColor" /> {company.score}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{company.city}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <p className="text-sm font-medium">No high-value targets identified. Run discovery.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" /> Pipeline Stages
            </h2>
          </div>
          <div className="p-6">
            {dashboardData?.pipelineDistribution.length > 0 ? (
              <div className="space-y-6">
                {dashboardData.pipelineDistribution.map((item: any) => (
                  <div key={item.stage}>
                    <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-wider">
                      <span className="text-gray-500">{item.stage}</span>
                      <span className="text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full shadow-sm" 
                        style={{ width: `${(item.count / dashboardData.stats.leads) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm font-medium">Identify decision makers to see pipeline progress.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
