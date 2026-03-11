import Link from 'next/link';
import { Building2, Target, Zap, Globe, ArrowRight, Star, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-8 border border-blue-100 shadow-sm animate-bounce">
              <Star size={16} fill="currentColor" /> The Employer Outreach Engine
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight mb-6">
              Scale Your Employer <br />
              <span className="text-blue-600">Acquisition</span> Engine
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium">
              A specialized infrastructure for discovering, scoring, and contacting high-value employers at scale. 
              Precision outreach meets local intelligence.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center gap-2"
              >
                Launch Your Engine <ArrowRight size={20} />
              </Link>
              <Link
                href="/login"
                className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-5 pointer-events-none">
           <div className="absolute top-40 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute top-60 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">The 3-Step Continuous Discovery Loop</h2>
            <p className="text-gray-500 mt-4 font-medium">Stop manual searching. Let the engine feed you high-value targets.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Continuous Discovery</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Automatically extract names, domains, and locations from LinkedIn, directories, and startup ecosystems.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. AI Enrichment & Scoring</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                The engine identifies hiring signals and assigns a score based on your ideal employer profile rules.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Decision-Maker Outreach</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Target people, not companies. Reach Founders and HR Heads via automated, timezone-aware sequences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-block bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-green-100">
              Compliance Built-In
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-6">Built for Compliant, <br />Global Scale</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              We aren&apos;t an email blaster. We are a precision command center. 
              With 10 AM local time scheduling, SPF/DKIM verification, and automated 
              Stop-on-Reply logic, your sender reputation stays elite.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-500" size={24} />
                <span className="font-bold text-gray-700">Automated Suppression Lists</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-500" size={24} />
                <span className="font-bold text-gray-700">Timezone-Aware Delivery Queue</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-500" size={24} />
                <span className="font-bold text-gray-700">Multi-Step Sequence Orchestration</span>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-blue-600 w-full aspect-square rounded-[40px] shadow-2xl shadow-blue-200 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700"></div>
             <Building2 size={120} className="text-white relative z-10 opacity-20" />
             <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <p className="text-white font-bold mb-2 italic">&quot;This engine scaled our employer network by 4x in 3 months.&quot;</p>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">— Growth Lead, TechCorp</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-gray-400">© 2026 OutreachSaaS • The Employer Outreach Engine</p>
        </div>
      </footer>
    </div>
  );
}
