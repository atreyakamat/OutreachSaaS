'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Star, 
  Bell, 
  Activity,
  ChevronRight,
  ArrowRight,
  Zap,
  Globe,
  PieChart
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PipelineDistribution {
  stage: string;
  count: number;
}

interface HighValueCompany {
  id: string;
  companyName: string;
  industry: string;
  score: number;
  city: string;
}

interface DashboardData {
  stats: {
    companies: number;
    leads: number;
    activeSequences: number;
    onboarded: number;
  };
  pipelineDistribution: PipelineDistribution[];
  highValueCompanies: HighValueCompany[];
}

interface Followup {
  id: string;
  company: {
    companyName: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  company: {
    name: string;
    companyName: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, followupsRes, activityRes] = await Promise.all([
          api.get('/stats'),
          api.get('/pipeline/followups'),
          api.get('/pipeline/activity')
        ]);
        setDashboardData(statsRes.data);
        setFollowups(followupsRes.data);
        setActivityLogs(activityRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Initializing Engine Intelligence...</div>;

  const stats = [
    { label: 'Companies Discovered', value: dashboardData?.stats.companies || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Decision Makers', value: dashboardData?.stats.leads || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Sequences', value: dashboardData?.stats.activeSequences || 0, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Partners Onboarded', value: dashboardData?.stats.onboarded || 0, icon: Star, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
             <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
             Engine Live
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
            Acquisition <span className="text-blue-600">Command</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">Welcome back, {user?.email.split('@')[0]}. Here is your employer intelligence.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/discovery" className="group bg-blue-600 text-white px-6 py-4 rounded-[24px] font-black text-sm shadow-xl shadow-blue-100 flex items-center gap-3 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
            Discover Companies <Zap size={18} fill="currentColor" className="group-hover:animate-bounce" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 group hover:border-blue-200 transition-all duration-500">
            <div className="flex flex-col gap-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-sm`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
           {/* Pipeline Performance */}
           <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-10 relative z-10">
                 <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                       <TrendingUp className="text-blue-600" /> Pipeline Performance
                    </h2>
                    <p className="text-sm text-gray-400 font-medium">Conversion flow across acquisition stages.</p>
                 </div>
                 <Link href="/pipeline" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:translate-x-2 transition-transform">
                    Full Pipeline →
                 </Link>
              </div>
              
              <div className="space-y-8 relative z-10">
                 {dashboardData?.pipelineDistribution.map((item: PipelineDistribution) => (
                   <div key={item.stage} className="group">
                      <div className="flex justify-between items-end mb-3">
                         <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-600 transition-colors">
                            {item.stage}
                         </span>
                         <span className="text-sm font-black text-gray-900">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-50 rounded-full h-4 overflow-hidden border border-gray-100 p-1">
                         <div 
                           className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full shadow-sm transition-all duration-1000 group-hover:shadow-blue-200" 
                           style={{ width: `${(item.count / (dashboardData.stats.leads || 1)) * 100}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>

              {/* BG Accent */}
              <PieChart size={200} className="absolute -bottom-20 -right-20 text-blue-50 opacity-50 rotate-12" />
           </div>

           {/* Activity Log */}
           <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-8">
                 <Activity className="text-purple-600" /> Live Feed
              </h2>
              <div className="space-y-8">
                 {activityLogs.slice(0, 5).map((log: ActivityLog) => (
                   <div key={log.id} className="flex gap-6 group">
                      <div className="relative">
                         <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {log.company.companyName[0]}
                         </div>
                         <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                            <Zap size={10} className="text-blue-600" fill="currentColor" />
                         </div>
                      </div>
                      <div className="flex-1 border-b border-gray-50 pb-6 group-last:border-none">
                         <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-black text-gray-900">
                               {log.action} <span className="text-gray-400 font-medium mx-1">at</span> {log.company.name}
                            </p>
                            <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <p className="text-xs text-gray-500 font-medium leading-relaxed">{log.details}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-12">
           {/* High Value Targets */}
           <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-lg font-black flex items-center gap-2 mb-8 uppercase tracking-widest">
                    <Star size={20} className="text-orange-400" fill="currentColor" /> Priority Targets
                 </h2>
                 <div className="space-y-6">
                    {dashboardData?.highValueCompanies.map((c: HighValueCompany) => (
                      <Link href={`/companies/${c.id}`} key={c.id} className="block group">
                         <div className="flex justify-between items-center">
                            <div>
                               <p className="text-sm font-black group-hover:text-blue-400 transition-colors">{c.companyName}</p>
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.industry}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-orange-400">{c.score} pts</p>
                               <p className="text-[9px] font-bold text-gray-600 uppercase">{c.city}</p>
                            </div>
                         </div>
                      </Link>
                    ))}
                 </div>
                 <Link href="/companies" className="mt-10 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition">
                    View All Targets <ArrowRight size={14} />
                 </Link>
              </div>
              <Globe size={300} className="absolute -bottom-20 -left-20 text-white opacity-[0.03] animate-spin-slow pointer-events-none" />
           </div>

           {/* Follow-up Section */}
           <div className="bg-orange-50 p-10 rounded-[48px] border border-orange-100 shadow-sm shadow-orange-50">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-lg font-black text-orange-900 flex items-center gap-2">
                    <Bell size={20} /> Tasks Due
                 </h2>
                 <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full text-xs font-black">
                    {followups.length}
                 </span>
              </div>
              <div className="space-y-4">
                 {followups.slice(0, 3).map((f: Followup) => (
                   <div key={f.id} className="bg-white/60 p-4 rounded-2xl border border-white flex items-center justify-between group cursor-pointer hover:bg-white transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-black">
                            {f.company.companyName[0]}
                         </div>
                         <div>
                            <p className="text-xs font-black text-gray-900">{f.company.companyName}</p>
                            <p className="text-[9px] font-bold text-orange-500 uppercase">Follow-up</p>
                         </div>
                      </div>
                      <ChevronRight size={16} className="text-orange-200 group-hover:text-orange-500 transition-colors" />
                   </div>
                 ))}
                 {followups.length > 3 && (
                   <p className="text-center text-[10px] font-black text-orange-400 uppercase tracking-widest">+{followups.length - 3} more reminders</p>
                 )}
                 <Link href="/reminders" className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-600 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-700 transition shadow-lg shadow-orange-100">
                    Open Tasks
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
