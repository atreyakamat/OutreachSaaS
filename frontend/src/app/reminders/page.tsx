'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  User, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Reminder {
  id: string;
  company: {
    companyName: string;
  };
  contact?: {
    name: string;
  };
  stage: string;
  notes?: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await api.get('/pipeline/followups');
      setReminders(response.data);
    } catch {
      console.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Checking for due tasks...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Bell className="text-orange-500" /> Outreach Reminders
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Never miss a follow-up with a potential partner.</p>
        </div>
        <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl text-sm font-black border border-orange-100 flex items-center gap-2">
           <AlertCircle size={18} /> {reminders.length} Tasks Due
        </div>
      </div>

      <div className="space-y-6">
        {reminders.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm">
             <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500 opacity-20" />
             <h3 className="text-xl font-black text-gray-900">All Caught Up!</h3>
             <p className="text-gray-400 font-medium mt-1">No follow-ups scheduled for today.</p>
          </div>
        ) : (
          reminders.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:border-orange-200 transition group flex flex-col md:flex-row items-start md:items-center gap-8">
               <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center font-black text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                  {item.company.companyName[0]}
               </div>
               
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-lg font-black text-gray-900">{item.company.companyName}</h3>
                     <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Due Today</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                     <span className="flex items-center gap-1.5"><User size={16} /> {item.contact?.name || 'Unknown'}</span>
                     <span className="flex items-center gap-1.5"><Clock size={16} /> {item.stage}</span>
                  </div>
                  {item.notes && (
                    <p className="mt-3 text-sm text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                      Last Note: &quot;{item.notes}&quot;
                    </p>
                  )}
               </div>

               <div className="flex gap-3 w-full md:w-auto">
                  <Link 
                    href="/pipeline"
                    className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    Action <ArrowRight size={18} />
                  </Link>
                  <button className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition border border-transparent hover:border-green-100">
                    <CheckCircle2 size={24} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
