'use client';

import { useAuth } from '@/context/AuthContext';
import { Users, Mail, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Leads', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Campaigns', value: '0', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Emails Sent', value: '0', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Dispatch', value: '0', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email}</h1>
        <p className="text-sm text-gray-500">Here's what's happening with your outreach today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center py-8">No recent activity to show.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Timezone Distribution</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center py-8">Upload leads to see geographic distribution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
