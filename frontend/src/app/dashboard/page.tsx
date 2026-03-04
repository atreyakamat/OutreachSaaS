'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  Users, 
  Building2, 
  Target, 
  Mail, 
  TrendingUp, 
  Star, 
  Clock, 
  Bell, 
  Activity,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
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
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Intelligence...</div>;

  const stats = [
    { label: 'Total Companies', value: dashboardData?.stats.companies || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Decision Makers', value: dashboardData?.stats.leads || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Sequences', value: dashboardData?.stats.activeSequences || 0, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Messages Sent', value: dashboardData?.stats.emailsSent || 0, icon: Mail, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Employer Acquisition Command Center
          </h1>
          <p className="text-sm text-gray-500 font-medium">Acquiring partners for SOLO ecosystem.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/discovery" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition">
            Start Discovery <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group">
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
        {/* Follow-up Reminders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2 uppercase tracking-widest">
              <Bell size={18} className="text-orange-500" /> Follow-ups Due
            </h2>
            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-black">
              {followups.length} Tasks
            </span>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px] divide-y divide-gray-50">
            {followups.length > 0 ? (
              followups.map((lead: any) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50/50 transition flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {lead.contactName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{lead.contactName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{lead.company.name}</p>
                    </div>
                  </div>
                  <Link href="/pipeline" className="opacity-0 group-hover:opacity-100 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Clock size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-wider">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2 uppercase tracking-widest">
              <Activity size={18} className="text-blue-500" /> Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-auto">
            {activityLogs.length > 0 ? (
              activityLogs.map((log: any) => (
                <div key={log.id} className="p-5 hover:bg-gray-50/30 transition">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {log.action} <span className="text-gray-400 font-medium">for</span> {log.company.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        {log.lead && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest">
                            {log.lead.contactName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <p className="text-sm font-medium">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
