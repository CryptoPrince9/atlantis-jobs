'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bot, Send, User, CheckCircle2, Sparkles, Clock, ShieldCheck, ArrowLeft, Award } from 'lucide-react';
import { db, Application, Interview, Job } from '../../../lib/db';
import { AIEngine, InterviewEvaluation } from '../../../lib/aiEngine';

export default function AIInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);

  const [messages, setMessages] = useState<{ role: 'ai' | 'candidate'; content: string; timestamp: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!applicationId) return;

    const apps = db.getApplications();
    const app = apps.find(a => a.id === applicationId);
    if (!app) return;

    setApplication(app);
    const foundJob = db.getJobs().find(j => j.id === app.job_id);
    setJob(foundJob || null);

    // Initialize or load interview
    let existingInt = db.getInterview(app.id);
    if (!existingInt) {
      existingInt = db.saveInterview({
        id: `int-${Date.now()}`,
        application_id: app.id,
        transcript: [
          {
            role: 'ai',
            content: `Hello! Welcome to your 24/7 AI Technical Screening Interview for **${foundJob?.title || 'Engineer'}** at **${foundJob?.company_name || 'Web3 Org'}**.\n\nTo begin question 1 of 5: Could you please introduce your technical background and highlight your experience with ${foundJob?.requirements.slice(0, 3).join(', ') || 'Web3'}?`,
            timestamp: new Date().toISOString(),
          }
        ],
        final_score: 0,
        summary: '',
        status: 'in_progress',
      });
    }

    setInterview(existingInt);
    setMessages(existingInt.transcript);
    if (existingInt.status === 'completed') {
      setIsComplete(true);
      if (existingInt.ai_evaluation) {
        setEvaluation(existingInt.ai_evaluation as InterviewEvaluation);
      }
    }
  }, [applicationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing || isComplete || !interview || !job) return;

    const candidateMsg = userInput.trim();
    setUserInput('');

    const newMessages = [
      ...messages,
      { role: 'candidate' as const, content: candidateMsg, timestamp: new Date().toISOString() }
    ];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      // Call open-source AI Interview engine
      const turnResult = await AIEngine.processInterviewTurn(
        job.title,
        job.requirements,
        newMessages
      );

      const updatedMessages = [
        ...newMessages,
        { role: 'ai' as const, content: turnResult.nextMessage, timestamp: new Date().toISOString() }
      ];

      setMessages(updatedMessages);

      if (turnResult.isComplete && turnResult.evaluation) {
        setIsComplete(true);
        setEvaluation(turnResult.evaluation);

        // Save finalized evaluation & transcript to database
        const updatedInterview: Interview = {
          ...interview,
          transcript: updatedMessages,
          ai_evaluation: turnResult.evaluation,
          final_score: turnResult.evaluation.final_score,
          summary: turnResult.evaluation.summary,
          status: 'completed',
          completed_at: new Date().toISOString(),
        };

        db.saveInterview(updatedInterview);
        db.updateApplicationStatus(applicationId, 'ai_interviewed');
      } else {
        // Save turn in progress
        db.saveInterview({
          ...interview,
          transcript: updatedMessages,
        });
      }

    } catch (err: any) {
      console.error('Interview error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/candidate')}
            className="p-2 rounded-xl bg-dark-800 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-400" /> 24/7 AI Screening Room
            </h1>
            <p className="text-xs text-gray-400">
              Role: <span className="text-emerald-400 font-semibold">{job?.title || 'Developer'}</span> • {job?.company_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-800 text-xs font-mono text-gray-300 border border-gray-800">
            <Clock className="w-3.5 h-3.5 text-brand-400" /> 5-Q Dynamic Screening
          </div>
          {isComplete && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-panel rounded-3xl border border-gray-800 flex flex-col h-[600px]">
        
        {/* Messages Scroll View */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${msg.role === 'candidate' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                msg.role === 'ai'
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'ai'
                  ? 'bg-dark-800/90 text-gray-200 border border-gray-800 rounded-tl-none'
                  : 'bg-gradient-to-r from-brand-600 to-emerald-700 text-dark-900 font-medium rounded-tr-none shadow-lg shadow-emerald-500/10'
              }`}>
                <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                  {msg.role === 'ai' ? 'NexusAI Interview Bot' : 'You'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-brand-400 animate-pulse p-3 bg-dark-800/50 rounded-xl w-fit">
              <Sparkles className="w-4 h-4" /> AI evaluating answer & preparing next question...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Evaluation Summary Banner (Shown on Completion) */}
        {isComplete && evaluation && (
          <div className="p-5 border-t border-brand-500/30 bg-brand-500/10 space-y-2 text-xs">
            <div className="font-bold text-sm text-brand-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-400" /> Candidate Evaluation Summary Generated
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-emerald-300">
              <div>Overall: {evaluation.final_score}/100</div>
              <div>Technical: {evaluation.technical_score}/100</div>
              <div>Comm: {evaluation.communication_score}/100</div>
              <div>Problem-Solving: {evaluation.problem_solving_score}/100</div>
            </div>
            <p className="text-gray-300 italic pt-1">{evaluation.summary}</p>
          </div>
        )}

        {/* Input Bar */}
        {!isComplete ? (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800/80 bg-dark-900/80 rounded-b-3xl flex gap-3">
            <input
              type="text"
              placeholder="Type your answer to the AI interviewer..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded-xl bg-dark-800 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={isProcessing || !userInput.trim()}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-dark-900" /> Send
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-gray-800 text-center text-xs text-emerald-400 font-bold bg-dark-900/80 rounded-b-3xl">
            Interview Finished! Your evaluation is recorded on the recruiter's candidate pipeline.
          </div>
        )}

      </div>

    </div>
  );
}
