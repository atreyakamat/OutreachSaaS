'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Network, 
  GraduationCap, 
  Building2, 
  Users, 
  ChevronRight, 
  Plus, 
  Globe, 
  MapPin,
  TrendingUp,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function NetworkGraphPage() {
  const [universities, setUniversities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      const [uniRes, studentRes] = await Promise.all([
        api.get('/network/universities'),
        api.get('/network/students')
      ]);
      setUniversities(uniRes.data);
      
      // Calculate basic stats for the dashboard
      const totalStudents = studentRes.data.length;
      const skills = studentRes.data.flatMap((s: any) => s.skills || []);
      const skillCounts = skills.reduce((acc: any, skill: string) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalStudents,
        universityCount: uniRes.data.length,
        skillDistribution: Object.entries(skillCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)
      });
    } catch (err) {
      console.error('Failed to fetch network data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Mapping the talent network...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100">
              <Network size={32} />
            </div>
            Talent Network Graph
          </h1>
          <p className="text-lg text-gray-500 font-medium mt-3">Visualizing the ecosystem of universities, students, and employers.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-indigo-600 text-white px-6 py-4 rounded-[24px] font-black text-sm shadow-xl shadow-indigo-100 flex items-center gap-3 hover:bg-indigo-700 transition-all">
            Connect University <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
               <GraduationCap size={32} />
            </div>
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
               <p className="text-3xl font-black text-gray-900">{stats?.totalStudents || 0}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
               <Building2 size={32} />
            </div>
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Universities</p>
               <p className="text-3xl font-black text-gray-900">{stats?.universityCount || 0}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <Briefcase size={32} />
            </div>
            <div>
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Open Opportunities</p>
               <p className="text-3xl font-black text-gray-900">12</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* University Explorer */}
        <div className="lg:col-span-2 space-y-8">
           <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 px-2">Institution Directory</h2>
           <div className="space-y-6">
              {universities.map((uni) => (
                <div key={uni.id} className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden group hover:border-indigo-200 transition-all duration-500">
                   <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/30">
                      <div className="flex gap-6 items-center">
                         <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
                            {uni.name[0]}
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">{uni.name}</h3>
                            <p className="text-sm text-gray-400 font-medium flex items-center gap-1.5 mt-1">
                               <MapPin size={14} /> {uni.city}, {uni.state}
                            </p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="text-right">
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{uni.colleges.length} Colleges</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                               {uni.colleges.reduce((acc: number, c: any) => acc + c._count.students, 0)} Students
                            </p>
                         </div>
                         <button className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all">
                            <ChevronRight size={20} />
                         </button>
                      </div>
                   </div>
                   
                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {uni.colleges.map((college: any) => (
                        <div key={college.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between group/college hover:bg-white hover:border-indigo-100 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover/college:bg-indigo-600 group-hover/college:text-white transition-all">
                                 {college.name[0]}
                              </div>
                              <div>
                                 <p className="text-xs font-black text-gray-900">{college.name}</p>
                                 <p className="text-[10px] text-gray-400 font-bold">{college._count.students} Students</p>
                              </div>
                           </div>
                           <Link href={`/network/colleges/${college.id}`} className="opacity-0 group-hover/college:opacity-100 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                              <ArrowRight size={14} />
                           </Link>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Talent Intelligence Sidebar */}
        <div className="space-y-12">
           <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-[11px] font-black flex items-center gap-2 mb-8 uppercase tracking-[0.3em] text-indigo-300">
                    <TrendingUp size={16} /> Skill Concentration
                 </h2>
                 <div className="space-y-8">
                    {stats?.skillDistribution.map(([skill, count]: any) => (
                      <div key={skill} className="group">
                         <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-100">{skill}</span>
                            <span className="text-sm font-black text-white">{count}</span>
                         </div>
                         <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-400 to-blue-400 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                            />
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="mt-12 p-6 bg-white/5 rounded-[32px] border border-white/10">
                    <p className="text-sm font-bold text-indigo-200 leading-relaxed">
                       "Companies on our network get direct access to this verified talent pool."
                    </p>
                 </div>
              </div>
              <Globe size={300} className="absolute -bottom-20 -left-20 text-white opacity-[0.03] animate-spin-slow pointer-events-none" />
           </div>

           <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm overflow-hidden relative">
              <h2 className="text-xl font-black text-gray-900 mb-2">Talent Filter</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Access the network</p>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Graduation Year</label>
                    <div className="flex flex-wrap gap-2">
                       {['2024', '2025', '2026'].map(year => (
                         <button key={year} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-indigo-600 hover:text-white transition-all">
                            {year}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skill Areas</label>
                    <div className="flex flex-wrap gap-2">
                       {['Frontend', 'Backend', 'Design', 'AI'].map(area => (
                         <button key={area} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-indigo-600 hover:text-white transition-all">
                            {area}
                         </button>
                       ))}
                    </div>
                 </div>
                 <button className="mt-4 w-full bg-gray-900 text-white py-4 rounded-[20px] font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-gray-100 flex items-center justify-center gap-2">
                    Search Talent Pool <Search size={18} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Search({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  );
}
