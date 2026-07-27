'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, injected } from 'wagmi';
import { Bot, Wallet, ShieldCheck, Zap, UserCheck, Briefcase, Sparkles, LogOut, Cpu } from 'lucide-react';
import { TARGET_CHAIN } from '../lib/web3Config';

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-400 to-indigo-500 p-[2px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-emerald-400">
                NexusAI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                BEP20
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400 inline" /> 24/7 Autonomous Recruiting
            </p>
          </div>
        </Link>

        {/* Navigation Routes */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-800/80 p-1.5 rounded-xl border border-gray-800">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === '/' 
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Explore Jobs
          </Link>
          <Link
            href="/recruiter"
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              pathname === '/recruiter'
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Recruiter Portal
          </Link>
          <Link
            href="/candidate"
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              pathname === '/candidate'
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-400" />
            Candidate Hub
          </Link>
        </nav>

        {/* Web3 Wallet State & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Chain badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-gray-800 text-xs text-yellow-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            BSC Mainnet (56)
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-dark-800 border border-brand-500/30 flex items-center gap-2 text-sm text-gray-200">
                <Wallet className="w-4 h-4 text-brand-400" />
                <span className="font-mono">{formatAddress(address)}</span>
              </div>
              <button
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                className="p-2 rounded-xl bg-dark-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-600 hover:to-emerald-700 text-dark-900 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Wallet className="w-4 h-4 text-dark-900" />
              Connect Web3 Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
