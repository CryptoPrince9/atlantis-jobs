'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Waves, ShieldCheck, Sparkles, ArrowRight, Search, 
  MapPin, DollarSign, Building2, UserCheck, Award, Compass, Cpu 
} from 'lucide-react';
import { db, Job } from '../lib/db';

export default function LandingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setJobs(db.getJobs());
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Glow ambient oceanic lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <Waves className="w-4 h-4 text-cyan-400" /> AtlantisJobs • Oceanic Web3 & AI Recruitment Pipeline
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Unlock Sovereign Web3 & AI Talent with <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400">24/7 Autonomous AI Screening</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Zero friction. Blockchain-verified 300 USDT job postings on BNB Smart Chain. Instant open-source AI resume parsing, match scoring, and dynamic live text-screening interviews.
        </p>

        {/* CTA Button Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/recruiter"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-abyss-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
          >
            Post a Job (300 USDT) <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/candidate"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-abyss-800/80 text-white font-bold text-base flex items-center justify-center gap-2 border border-cyan-500/30 transition-all hover:scale-105"
          >
            Candidate Hub & 10 USDT Boost <UserCheck className="w-5 h-5 text-teal-400" />
          </Link>
        </div>

        {/* Live Feature Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
            <div className="text-2xl font-extrabold text-cyan-400">100% Free</div>
            <div className="text-xs text-gray-400 mt-1">Open-source LLM routing</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
            <div className="text-2xl font-extrabold text-teal-400">BSC Mainnet</div>
            <div className="text-xs text-gray-400 mt-1">BEP20 USDT Verification</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
            <div className="text-2xl font-extrabold text-indigo-400">24/7 AI Chat</div>
            <div className="text-xs text-gray-400 mt-1">Automated 5-Q Screening</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20">
            <div className="text-2xl font-extrabold text-amber-400">Top-Ranked</div>
            <div className="text-xs text-gray-400 mt-1">10 USDT 30-Day Boost</div>
          </div>
        </div>

      </section>

      {/* Live Job Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Active Atlantis Job Listings
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Verified
              </span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Explore position listings backed by 300 USDT smart contract verification on BNB Smart Chain.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, skills, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-abyss-900 border border-cyan-500/20 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="glass-card p-6 rounded-2xl border border-cyan-500/20 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-950 to-abyss-900 border border-cyan-500/30 flex items-center justify-center font-bold text-lg text-cyan-400">
                      {job.company_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-500" /> {job.company_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    300 USDT Verified
                  </span>
                </div>

                <p className="text-gray-300 text-sm mt-4 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {job.requirements.map((req, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-abyss-900 text-gray-300 border border-cyan-500/20">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-teal-400 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" /> {job.salary_range}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                  </span>
                </div>

                <Link
                  href="/candidate"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-semibold flex items-center gap-1 transition-colors"
                >
                  Apply & AI Interview <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Atlantis Paywall & AI Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">How AtlantisJobs Operates</h2>
          <p className="text-gray-400 text-sm mt-2">
            Standardized Web3 smart contract paywalls combined with open-source AI model inference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xl">
              1
            </div>
            <h3 className="font-bold text-lg text-white">300 USDT Company Paywall</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Recruiters trigger a 300 USDT BEP20 transaction on BSC to <code className="text-teal-400">0xe2f8...14ec</code>. The backend verifies block confirmation before publishing the job.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
              2
            </div>
            <h3 className="font-bold text-lg text-white">Open-Source AI Resume Parsing</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Candidate CVs are parsed into structured JSON (skills, experience, education) using free Hugging Face / Groq inference and scored against job requirements.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xl">
              3
            </div>
            <h3 className="font-bold text-lg text-white">24/7 Dynamic AI Chat Screening</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Candidates complete a 5-question automated technical screening. The AI evaluates answers live and posts a full transcript & score to the recruiter dashboard.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
