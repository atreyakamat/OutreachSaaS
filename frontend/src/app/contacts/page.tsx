'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Users, 
  Search, 
  Filter, 
  Linkedin, 
  Mail, 
  Phone, 
  Building2, 
  Star, 
  UserCheck, 
  ChevronRight,
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [roleFilter]);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts', {
        params: { role: roleFilter }
      });
      setContacts(response.data);
    } catch (err) {
      console.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await api.patch(`/contacts/${id}/primary`);
      fetchContacts();
    } catch (err) {
      alert('Failed to update primary contact');
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.companyName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading contacts...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" /> Decision Makers
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage ranked contacts at target companies.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or company..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select 
              className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Founder">Founder</option>
              <option value="CEO">CEO</option>
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Person</th>
                <th className="px-6 py-5">Company</th>
                <th className="px-6 py-5">Role / Priority</th>
                <th className="px-6 py-5">Contact Details</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className={`hover:bg-blue-50/30 transition group ${contact.isPrimary ? 'bg-blue-50/10' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${
                        contact.isPrimary ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {contact.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight flex items-center gap-2">
                          {contact.name}
                          {contact.isPrimary && <UserCheck size={14} className="text-blue-600" />}
                        </p>
                        <Link href={contact.linkedinUrl || '#'} target="_blank" className="text-xs text-gray-400 font-bold flex items-center gap-1 hover:text-blue-600">
                          <Linkedin size={10} /> LinkedIn Profile
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <Link href={`/companies/${contact.companyId}`} className="flex items-center gap-2 group/co">
                      <Building2 size={14} className="text-gray-300 group-hover/co:text-blue-600" />
                      <span className="text-xs font-black text-gray-700 group-hover/co:text-blue-600">{contact.company.companyName}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs font-bold text-gray-700">{contact.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score: {contact.priorityScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                       <Mail size={12} /> {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                         <Phone size={12} /> {contact.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!contact.isPrimary && (
                        <button 
                          onClick={() => handleSetPrimary(contact.id)}
                          className="p-2 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition"
                          title="Mark as Primary"
                        >
                          <Star size={18} />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
