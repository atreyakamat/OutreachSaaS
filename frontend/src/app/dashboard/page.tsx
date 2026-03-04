'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Users, Mail, CheckCircle, Clock, MapPin, Activity } from 'lucide-react';

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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your command center...</div>;

  const stats = [
    { label: 'Total Leads', value: dashboardData?.stats.leads || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Sequences', value: dashboardData?.stats.activeSequences || 0, icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Emails Sent', value: dashboardData?.stats.emailsSent || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Dispatch', value: dashboardData?.stats.pendingEmails || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Outbound Command Center</h1>
          <p className="text-sm text-gray-500">Global outreach metrics for {user?.email}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Backend Online
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
            <Activity size={14} />
            Worker Running
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-extrabold text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Recent Dispatch Activity
            </h2>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Full Log</button>
          </div>
          <div className="divide-y divide-gray-50">
            {dashboardData?.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity: any) => (
                <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${activity.status === 'SENT' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {activity.status === 'SENT' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{activity.lead.contactName}</p>
                      <p className="text-xs text-gray-500">{activity.campaign.name} • {activity.lead.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-400">
                      {new Date(activity.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </p>
                    <p className={`text-[10px] font-bold uppercase ${activity.status === 'SENT' ? 'text-green-500' : 'text-orange-500'}`}>
                      {activity.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <p className="text-sm">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <MapPin size={18} className="text-red-500" /> Lead Timezones
            </h2>
          </div>
          <div className="p-4">
            {dashboardData?.tzDistribution.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.tzDistribution.map((tz: any) => (
                  <div key={tz.timezone}>
                    <div className="flex justify-between text-xs mb-1 font-semibold">
                      <span className="text-gray-600">{tz.timezone}</span>
                      <span className="text-gray-900">{tz.count} leads</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${(tz.count / dashboardData.stats.leads) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">Upload leads to see distribution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
