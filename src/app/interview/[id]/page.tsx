'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bot, Send, User, CheckCircle2, Sparkles, Clock, ShieldCheck, ArrowLeft, Award, Waves } from 'lucide-react';
import { db, Application, Interview, Job } from '../../../lib/db';
import { AIEngine, InterviewEvaluation } from '../../../lib/aiEngine';

export default function AIInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const applicationId = (params?.id as string) || 'demo';

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
    const foundJob = app ? db.getJobs().find(j => j.id === app.job_id) : db.getJobs()[0];

    if (app) setApplication(app);
    setJob(foundJob || null);

    // Initialize or load interview
    let existingInt = db.getInterview(app ? app.id : applicationId);
    if (!existingInt) {
      existingInt = db.saveInterview({
        id: `int-${Date.now()}`,
        application_id: app ? app.id : applicationId,
        transcript: [
          {
            role: 'ai',
            content: `Hello! Welcome to your 24/7 AtlantisJobs AI Technical Screening Interview for **${foundJob?.title || 'Senior Engineer'}** at **${foundJob?.company_name || 'Web3 Org'}**.\n\nTo begin question 1 of 5: Could you please introduce your technical background and highlight your experience with ${foundJob?.requirements.slice(0, 3).join(', ') || 'Web3'}?`,
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
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/candidate')}
            className="p-2 rounded-xl bg-abyss-900 hover:bg-abyss-800 text-gray-400 hover:text-white border border-cyan-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              <Waves className="w-5 h-5 text-cyan-400" /> Atlantis 24/7 AI Screening Room
            </h1>
            <p className="text-xs text-gray-400">
              Role: <span className="text-cyan-400 font-semibold">{job?.title || 'Developer'}</span> • {job?.company_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-abyss-900 text-xs font-mono text-gray-300 border border-cyan-500/20">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> 5-Q Dynamic Screening
          </div>
          {isComplete && (
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-panel rounded-3xl border border-cyan-500/20 flex flex-col h-[600px]">
        
        {/* Messages Scroll View */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${msg.role === 'candidate' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                msg.role === 'ai'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
              }`}>
                {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'ai'
                  ? 'bg-abyss-900/90 text-gray-200 border border-cyan-500/20 rounded-tl-none'
                  : 'bg-gradient-to-r from-cyan-600 to-teal-700 text-abyss-950 font-medium rounded-tr-none shadow-lg shadow-cyan-500/10'
              }`}>
                <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-70">
                  {msg.role === 'ai' ? 'Atlantis AI Interview Bot' : 'You'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-3 bg-abyss-900/50 rounded-xl w-fit">
              <Sparkles className="w-4 h-4" /> Atlantis AI evaluating answer & preparing next question...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Evaluation Summary Banner (Shown on Completion) */}
        {isComplete && evaluation && (
          <div className="p-5 border-t border-cyan-500/30 bg-cyan-500/10 space-y-2 text-xs">
            <div className="font-bold text-sm text-cyan-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" /> Candidate Evaluation Summary Generated
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-teal-300">
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
          <form onSubmit={handleSendMessage} className="p-4 border-t border-cyan-500/20 bg-abyss-950/80 rounded-b-3xl flex gap-3">
            <input
              type="text"
              placeholder="Type your answer to the Atlantis AI interviewer..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded-xl bg-abyss-900 border border-cyan-500/20 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isProcessing || !userInput.trim()}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-abyss-950 font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-abyss-950" /> Send
            </button>
          </form>
        ) : (
          <div className="p-4 border-t border-cyan-500/20 text-center text-xs text-teal-400 font-bold bg-abyss-950/80 rounded-b-3xl">
            Interview Finished! Your evaluation is recorded on the Atlantis recruiter pipeline.
          </div>
        )}

      </div>

    </div>
  );
}
