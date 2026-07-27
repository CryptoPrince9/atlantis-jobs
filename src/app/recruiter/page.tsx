'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Wallet, ShieldCheck, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, UserCheck, Bot, FileText, 
  Sparkles, ExternalLink, Filter, Search, Award
} from 'lucide-react';
import { useUsdtPayment } from '../../hooks/useUsdtPayment';
import { db, Job, Application, Interview, Candidate } from '../../lib/db';
import { DESTINATION_WALLET, JOB_POST_COST_USDT } from '../../lib/web3Config';

export default function RecruiterDashboard() {
  const { executePayment, loading: txLoading, error: txError, isConnected, address } = useUsdtPayment();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salaryRange, setSalaryRange] = useState('$120,000 - $160,000 USDT');

  // Transaction state
  const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'confirming' | 'verifying' | 'success' | 'failed'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Selected applicant modal detail state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const loadedJobs = db.getJobs();
    setJobs(loadedJobs);
    if (loadedJobs.length > 0 && !selectedJob) {
      setSelectedJob(loadedJobs[0]);
    }
    setApplications(db.getApplications());
    setCandidates(db.getCandidates());
  };

  const handlePostJobWithWeb3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyName || !description) {
      alert('Please fill in all required job fields.');
      return;
    }

    try {
      setTxStatus('signing');
      setStatusMessage('Please confirm the 300 USDT transfer in your Web3 wallet...');

      // 1. Trigger BSC BEP20 USDT Transfer for 300 USDT
      const hash = await executePayment(JOB_POST_COST_USDT);
      setTxHash(hash);
      setTxStatus('confirming');
      setStatusMessage(`Transaction submitted: ${hash.substring(0, 10)}... Waiting for block confirmation on BSC...`);

      // 2. Simulate/Perform server-side blockchain verification
      setTxStatus('verifying');
      setStatusMessage('Verifying transaction receipt on BNB Smart Chain RPC node...');

      const verifyRes = await fetch('/api/verify-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: hash,
          expectedAmount: JOB_POST_COST_USDT,
          expectedType: 'job_posting_300_usdt',
          senderWallet: address || '0xWalletAddress',
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Blockchain transaction verification failed.');
      }

      // 3. Save Job to Database with status 'active'
      const newJob = db.addJob({
        title,
        company_name: companyName,
        company_wallet: address || '0xRecruiterWallet',
        description,
        requirements: requirementsText.split(',').map(s => s.trim()).filter(Boolean),
        location,
        salary_range: salaryRange,
        tx_hash: hash,
        payment_amount: JOB_POST_COST_USDT,
        status: 'active',
      });

      setTxStatus('success');
      setStatusMessage('Job post verified & published to live pipeline board!');
      refreshData();
      setSelectedJob(newJob);

      setTimeout(() => {
        setShowModal(false);
        setTxStatus('idle');
        setTitle('');
        setDescription('');
        setRequirementsText('');
      }, 2000);

    } catch (err: any) {
      setTxStatus('failed');
      setStatusMessage(err?.message || 'Transaction rejected or failed.');
    }
  };

  const handleSelectApplication = (app: Application) => {
    setSelectedApp(app);
    const candidate = candidates.find(c => c.wallet_address.toLowerCase() === app.candidate_wallet.toLowerCase());
    setSelectedCandidate(candidate || null);
    const interview = db.getInterview(app.id);
    setSelectedInterview(interview || null);
  };

  const filteredApps = applications.filter(app => selectedJob ? app.job_id === selectedJob.id : true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            Recruiter Mission Control
            <span className="text-xs px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              300 USDT Paywall Active
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage blockchain-verified job listings, review applicant match scores, and inspect 24/7 AI screening transcripts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-600 hover:to-emerald-700 text-dark-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5 text-dark-900" /> Post Job (300 USDT)
        </button>
      </div>

      {/* Main Recruiter Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Job Selector */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Job Posts</h3>
          <div className="space-y-3">
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  selectedJob?.id === job.id
                    ? 'bg-brand-500/10 border-brand-500/40 text-white shadow-lg shadow-emerald-500/10'
                    : 'glass-card border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="font-bold text-sm text-white">{job.title}</div>
                <div className="text-xs text-gray-400 mt-1">{job.company_name}</div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-mono font-semibold">{job.payment_amount} USDT</span>
                  <span className="text-gray-500 font-mono">{job.tx_hash.substring(0, 8)}...</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Applicant Pipeline Kanban Board */}
        <div className="lg:col-span-3 space-y-6">
          
          {selectedJob && (
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Selected Position</span>
                <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
              </div>
              <div className="text-xs text-gray-400 font-mono bg-dark-800 px-3 py-1.5 rounded-lg border border-gray-800">
                {selectedJob.salary_range} | {selectedJob.location}
              </div>
            </div>
          )}

          {/* Pipeline Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {['applied', 'ai_interviewed', 'shortlisted', 'rejected'].map((status) => {
              const statusApps = filteredApps.filter(a => a.status === status);
              const statusTitles: Record<string, string> = {
                applied: 'Applied',
                ai_interviewed: 'AI Interviewed',
                shortlisted: 'Shortlisted',
                rejected: 'Rejected',
              };

              return (
                <div key={status} className="bg-dark-800/50 p-4 rounded-2xl border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      {statusTitles[status]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-brand-400 font-bold">
                      {statusApps.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[300px]">
                    {statusApps.map(app => {
                      const cand = candidates.find(c => c.wallet_address.toLowerCase() === app.candidate_wallet.toLowerCase());
                      return (
                        <div
                          key={app.id}
                          onClick={() => handleSelectApplication(app)}
                          className="glass-card p-3.5 rounded-xl border border-gray-800 cursor-pointer hover:border-brand-500/40 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{app.candidate_name || 'Candidate'}</span>
                            {cand?.is_premium && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30 flex items-center gap-1">
                                <Award className="w-3 h-3" /> BOOST
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Match Score:</span>
                            <span className={`font-bold ${app.match_score >= 85 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                              {app.match_score}%
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-500 font-mono truncate">
                            {app.candidate_wallet}
                          </div>
                        </div>
                      );
                    })}

                    {statusApps.length === 0 && (
                      <div className="text-xs text-gray-600 text-center py-8">
                        No candidates in this stage.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>

        </div>

      </div>

      {/* Modal 1: Post Job 300 USDT Smart Contract Web3 Flow */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-gray-700 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-400" /> Post Job (300 USDT Web3 Paywall)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Triggers BEP20 USDT transfer to destination address <code className="text-emerald-400">{DESTINATION_WALLET.substring(0, 10)}...</code> on BSC.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handlePostJobWithWeb3} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Smart Contract Architect"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-gray-800 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neural Agent Labs"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-gray-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $130,000 - $170,000 USDT"
                    value={salaryRange}
                    onChange={e => setSalaryRange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-gray-800 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Solidity, Viem, Next.js, BSC, Python"
                  value={requirementsText}
                  onChange={e => setRequirementsText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-gray-800 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed job description and responsibilities..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-gray-800 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Status Feedback Box */}
              {txStatus !== 'idle' && (
                <div className={`p-4 rounded-xl border text-xs space-y-1 ${
                  txStatus === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : txStatus === 'failed'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 animate-pulse'
                }`}>
                  <div className="font-bold uppercase tracking-wider">Status: {txStatus}</div>
                  <div>{statusMessage}</div>
                  {txHash && (
                    <div className="font-mono text-[11px] truncate pt-1">
                      Tx Hash: {txHash}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Required: <span className="font-bold text-emerald-400">300 USDT (BEP20)</span>
                </div>

                <button
                  type="submit"
                  disabled={txLoading || txStatus === 'confirming' || txStatus === 'verifying'}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-600 text-dark-900 font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all"
                >
                  <Wallet className="w-4 h-4 text-dark-900" /> Confirm 300 USDT Tx & Post
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Applicant View & AI Interview Transcript Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-3xl w-full p-6 sm:p-8 rounded-3xl border border-gray-700 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" /> Candidate Evaluation Profile
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Wallet: {selectedApp.candidate_wallet}
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Match Score & Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-xs text-gray-400">AI Match Score</div>
                <div className="text-2xl font-extrabold text-brand-400 mt-1">{selectedApp.match_score}%</div>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-xs text-gray-400">Interview Status</div>
                <div className="text-base font-bold text-indigo-400 uppercase mt-2">{selectedApp.status}</div>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-xs text-gray-400">Premium Boost</div>
                <div className="text-base font-bold text-yellow-400 mt-2">
                  {selectedCandidate?.is_premium ? '30-Day Active' : 'Standard'}
                </div>
              </div>
            </div>

            {/* AI Screening Interview Transcript */}
            {selectedInterview ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-brand-400" /> 24/7 AI Interview Transcript & Evaluation
                </h3>

                {selectedInterview.ai_evaluation && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-2 text-indigo-200">
                    <div className="font-bold text-sm text-indigo-300">
                      Recommendation: {selectedInterview.ai_evaluation.overall_recommendation}
                    </div>
                    <div>{selectedInterview.summary}</div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-500/20 font-mono">
                      <div>Tech: {selectedInterview.ai_evaluation.technical_score}/100</div>
                      <div>Comm: {selectedInterview.ai_evaluation.communication_score}/100</div>
                      <div>Solve: {selectedInterview.ai_evaluation.problem_solving_score}/100</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 bg-dark-800/60 p-4 rounded-2xl border border-gray-800 max-h-60 overflow-y-auto">
                  {selectedInterview.transcript.map((msg, idx) => (
                    <div key={idx} className={`p-3 rounded-xl text-xs ${
                      msg.role === 'ai' ? 'bg-dark-900 text-brand-300 border border-brand-500/20' : 'bg-gray-800 text-gray-200 ml-4'
                    }`}>
                      <div className="font-bold mb-1 uppercase text-[10px] tracking-wider text-gray-400">
                        {msg.role === 'ai' ? 'AI Screening Bot' : 'Candidate'}
                      </div>
                      <div>{msg.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center py-6">
                No interview transcript completed yet.
              </div>
            )}

            {/* Pipeline Stage Updater */}
            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Move candidate stage:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    db.updateApplicationStatus(selectedApp.id, 'shortlisted');
                    refreshData();
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => {
                    db.updateApplicationStatus(selectedApp.id, 'rejected');
                    refreshData();
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/30"
                >
                  Reject
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
