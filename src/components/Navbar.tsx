'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, injected } from 'wagmi';
import { Waves, Wallet, ShieldCheck, UserCheck, Briefcase, Sparkles, LogOut, Compass } from 'lucide-react';
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
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* AtlantisJobs Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-400 to-indigo-500 p-[2px] shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-abyss-950 rounded-[10px] flex items-center justify-center">
              <Waves className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-teal-300">
                AtlantisJobs
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                BEP20
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Compass className="w-3 h-3 text-teal-400 inline" /> Sovereign AI & Web3 Talent Mesh
            </p>
          </div>
        </Link>

        {/* Navigation Routes */}
        <nav className="hidden md:flex items-center gap-1 bg-abyss-900/80 p-1.5 rounded-xl border border-cyan-500/20">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === '/' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-abyss-800/60'
            }`}
          >
            Explore Jobs
          </Link>
          <Link
            href="/recruiter"
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              pathname === '/recruiter'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-abyss-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Recruiter Portal
          </Link>
          <Link
            href="/candidate"
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              pathname === '/candidate'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-abyss-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4 text-teal-400" />
            Candidate Hub
          </Link>
        </nav>

        {/* Web3 Wallet State & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Chain badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-abyss-900 border border-cyan-500/20 text-xs text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            BSC Mainnet (56)
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-abyss-900 border border-cyan-500/30 flex items-center gap-2 text-sm text-gray-200">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span className="font-mono">{formatAddress(address)}</span>
              </div>
              <button
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                className="p-2 rounded-xl bg-abyss-900 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-cyan-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-abyss-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <Wallet className="w-4 h-4 text-abyss-950" />
              Connect Web3 Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
