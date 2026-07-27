'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCheck, Sparkles, Zap, Award, Upload, CheckCircle2, 
  FileText, ArrowRight, Wallet, ShieldCheck, Play
} from 'lucide-react';
import { useUsdtPayment } from '../../hooks/useUsdtPayment';
import { db, Candidate, Job, Application } from '../../lib/db';
import { AIEngine, ParsedResume } from '../../lib/aiEngine';
import { CANDIDATE_BOOST_COST_USDT, DESTINATION_WALLET } from '../../lib/web3Config';

export default function CandidateDashboard() {
  const { executePayment, loading: txLoading, error: txError, isConnected, address } = useUsdtPayment();

  const [rawCvText, setRawCvText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Boost Transaction State
  const [boostStatus, setBoostStatus] = useState<'idle' | 'signing' | 'confirming' | 'verifying' | 'success' | 'failed'>('idle');
  const [boostTxHash, setBoostTxHash] = useState<string | null>(null);
  const [boostMsg, setBoostMsg] = useState('');

  useEffect(() => {
    refreshData();
  }, [address]);

  const refreshData = () => {
    setJobs(db.getJobs());
    if (address) {
      const existingCand = db.getCandidateByWallet(address);
      if (existingCand) {
        setCandidate(existingCand);
      }
    }
    setApplications(db.getApplications());
  };

  const handleParseCv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawCvText || rawCvText.length < 20) {
      alert('Please paste a detailed resume or text dump.');
      return;
    }

    try {
      setParsing(true);
      
      // Call open-source AI resume parser
      const parsed = await AIEngine.parseResume(rawCvText);
      setParsedData(parsed);

      const wallet = address || '0xCandidateWallet';
      const savedCand = db.saveCandidate({
        wallet_address: wallet,
        name: parsed.name,
        email: parsed.email,
        raw_cv: rawCvText,
        parsed_skills: parsed.skills,
        parsed_experience: parsed.experience,
        parsed_education: parsed.education,
      });

      setCandidate(savedCand);
      alert('Resume parsed & structured into Web3 candidate profile successfully!');
    } catch (err: any) {
      alert('Parse error: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handle10UsdtBoost = async () => {
    if (!address) {
      alert('Please connect your Web3 wallet to boost your candidate profile.');
      return;
    }

    try {
      setBoostStatus('signing');
      setBoostMsg('Please confirm the 10 USDT transfer in your Web3 wallet...');

      // 1. Trigger 10 USDT transfer to destination wallet on BSC
      const hash = await executePayment(CANDIDATE_BOOST_COST_USDT);
      setBoostTxHash(hash);

      setBoostStatus('confirming');
      setBoostMsg(`Transaction submitted: ${hash.substring(0, 10)}... Waiting for BSC block confirmation...`);

      // 2. Perform backend verification
      setBoostStatus('verifying');
      setBoostMsg('Verifying 10 USDT transaction on BSC RPC node...');

      const res = await fetch('/api/candidates/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: hash,
          candidateWallet: address,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Boost verification failed.');
      }

      // 3. Mark candidate as premium: true for 30 days
      const updatedCand = db.saveCandidate({
        wallet_address: address,
        is_premium: true,
        premium_until: new Date(Date.now() + 30 * 86400000).toISOString(),
        premium_tx_hash: hash,
      });

      setCandidate(updatedCand);
      setBoostStatus('success');
      setBoostMsg('🚀 Profile Boosted for 30 Days! Ranked top in recruiter searches.');

    } catch (err: any) {
      setBoostStatus('failed');
      setBoostMsg(err?.message || 'Transaction rejected.');
    }
  };

  const handleApplyAndStartInterview = (job: Job) => {
    const wallet = address || '0xCandidateWallet';
    
    // Calculate candidate match score against job
    const candidateSkills = candidate?.parsed_skills || ['Solidity', 'Next.js', 'TypeScript'];
    const matchScore = AIEngine.calculateMatchScore(candidateSkills, job.requirements, job.description);

    // Create Application
    const newApp = db.addApplication({
      job_id: job.id,
      candidate_wallet: wallet,
      candidate_name: candidate?.name || 'Anonymous Applicant',
      match_score: matchScore,
      status: 'applied',
    });

    refreshData();
    // Redirect to 24/7 AI Interview Room
    window.location.href = `/interview/${newApp.id}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold mb-3 border border-indigo-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Free Candidate Hub & AI Parser
          </div>
          <h1 className="text-3xl font-extrabold text-white">Candidate Career Portal</h1>
          <p className="text-gray-400 text-sm mt-1">
            Build your Web3 profile, parse CV with free open-source AI, and complete 24/7 automated chat interviews.
          </p>
        </div>

        {/* 10 USDT Boost Banner */}
        <div className="glass-card p-5 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 max-w-sm w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" /> Premium Profile Boost
            </span>
            <span className="text-xs font-mono font-bold text-yellow-400 px-2 py-0.5 rounded bg-yellow-500/20">
              10 USDT / 30 Days
            </span>
          </div>

          <p className="text-xs text-gray-300">
            Rank at the top of recruiter pipelines for 30 days via BEP20 USDT transaction to <code className="text-yellow-400">0xe2f8...14ec</code>.
          </p>

          {candidate?.is_premium ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 30-Day Boost Active!
            </div>
          ) : (
            <button
              onClick={handle10UsdtBoost}
              disabled={boostStatus === 'confirming' || boostStatus === 'verifying'}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 text-dark-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-dark-900" /> Boost Profile for 10 USDT
            </button>
          )}

          {boostMsg && (
            <div className="text-[11px] text-yellow-300 font-mono pt-1">
              {boostMsg}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: AI Resume Parser & Profile Builder */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" /> AI Resume Parser
            </h2>
            <p className="text-xs text-gray-400">
              Paste your raw CV text. Hugging Face / Groq open-source LLM will structure it into JSON.
            </p>

            <form onSubmit={handleParseCv} className="space-y-4">
              <textarea
                required
                rows={6}
                placeholder="Paste full resume text here (Skills, Experience, Education...)"
                value={rawCvText}
                onChange={e => setRawCvText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />

              <button
                type="submit"
                disabled={parsing}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {parsing ? 'Parsing with Open LLM...' : 'Extract & Save Structured CV'}
              </button>
            </form>

            {candidate && (
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <div className="text-xs font-bold text-brand-400">Extracted Skills:</div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.parsed_skills.map((skill, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-1 rounded bg-dark-800 text-gray-300 border border-gray-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Apply & Launch 24/7 AI Interview */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">Apply & Start 24/7 AI Interview</h2>
          
          <div className="space-y-4">
            {jobs.map(job => {
              const existingApp = applications.find(a => a.job_id === job.id && a.candidate_wallet.toLowerCase() === (address || '0xCandidateWallet').toLowerCase());
              
              return (
                <div key={job.id} className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-white">{job.title}</h3>
                    <p className="text-xs text-gray-400">{job.company_name} • {job.salary_range}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requirements.map((req, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-dark-800 text-gray-400">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {existingApp ? (
                      <Link
                        href={`/interview/${existingApp.id}`}
                        className="px-5 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-2 hover:bg-indigo-500/30"
                      >
                        <Play className="w-4 h-4 fill-indigo-400" /> Enter AI Interview Room
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleApplyAndStartInterview(job)}
                        className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-900 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                      >
                        Apply & Start AI Interview <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
