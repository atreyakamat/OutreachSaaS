'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  CheckCircle2,
  Globe,
  Briefcase
} from 'lucide-react';

interface AnalyticsData {
  stats: {
    conversionRate: string;
    leads: number;
    topIndustry: string;
    topIndustryPercent: number;
  };
  regionalDistribution: {
    country: string;
    count: number;
  }[];
  pipelineDistribution: {
    stage: string;
    count: number;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/stats');
      setData(response.data);
    } catch {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Generating intelligence report...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Error loading data.</div>;

  const totalRegions = data.regionalDistribution?.reduce((acc: number, cur: { count: number }) => acc + cur.count, 0) || 1;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="text-blue-600" /> Outreach Analytics
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Deep insights into your acquisition performance.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-gray-100 flex gap-1">
           <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Last 30 Days</button>
           <button className="px-4 py-2 text-gray-400 hover:bg-gray-50 rounded-xl text-xs font-bold transition">Last 90 Days</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-blue-600 mb-6">
                 <Target size={24} />
                 <span className="text-sm font-black uppercase tracking-widest">Conversion Rate</span>
              </div>
              <p className="text-5xl font-black text-gray-900 mb-2">{data.stats?.conversionRate || '0.0'}%</p>
              <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                 <TrendingUp size={16} /> Based on leads onboarded
              </div>
           </div>
           <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-purple-600 mb-6">
                 <Users size={24} />
                 <span className="text-sm font-black uppercase tracking-widest">Active Leads</span>
              </div>
              <p className="text-5xl font-black text-gray-900 mb-2">{data.stats?.leads || 0}</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Engaged in sequences</p>
           </div>
        </div>

        <div className="bg-blue-600 p-8 rounded-[32px] shadow-xl shadow-blue-100 flex flex-col justify-between text-white relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-lg font-black mb-4 uppercase tracking-widest opacity-80">Top Industry</h3>
              <p className="text-4xl font-black mb-2 truncate">{data.stats?.topIndustry || 'N/A'}</p>
              <p className="text-sm font-medium opacity-70">{data.stats?.topIndustryPercent || 0}% of your partner network</p>
           </div>
           <Briefcase size={140} className="absolute -bottom-10 -right-10 opacity-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
               <Globe size={18} className="text-blue-500" /> Regional Distribution
            </h3>
            {data.regionalDistribution?.length === 0 ? (
              <p className="text-sm text-gray-400">No regional data available yet.</p>
            ) : (
              <div className="space-y-6">
                 {data.regionalDistribution?.map((item) => (
                   <div key={item.country || 'Unknown'}>
                      <div className="flex justify-between text-xs mb-2 font-black uppercase tracking-widest text-gray-400">
                         <span>{item.country || 'Unknown'}</span>
                         <span className="text-gray-900">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-50 rounded-full h-3">
                         <div 
                           className="bg-blue-600 h-3 rounded-full shadow-sm" 
                           style={{ width: `${(item.count / totalRegions) * 100}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
            )}
         </div>

         <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
               <CheckCircle2 size={18} className="text-green-500" /> Pipeline Distribution
            </h3>
            {data.pipelineDistribution?.length === 0 ? (
               <p className="text-sm text-gray-400">No pipeline data available yet.</p>
            ) : (
               <div className="space-y-6">
                  {data.pipelineDistribution?.map((item) => (
                    <div key={item.stage}>
                       <div className="flex justify-between text-xs mb-2 font-black uppercase tracking-widest text-gray-400">
                          <span>{item.stage}</span>
                          <span className="text-gray-900">{item.count}</span>
                       </div>
                       <div className="w-full bg-gray-50 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full shadow-sm" 
                            style={{ width: `${(item.count / (data.stats?.leads || 1)) * 100}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
