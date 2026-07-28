'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Waves, Wallet, UserCheck, Briefcase, LogOut, Compass, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { db } from '../lib/db';

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [customWallet, setCustomWallet] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeWallet = address || customWallet;
  const isWalletActive = isConnected || !!customWallet;

  const formatAddress = (addr?: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnectInjected = async () => {
    setErrorMsg(null);

    // 1. Check if MetaMask / Injected provider exists in browser
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setErrorMsg('MetaMask extension not detected in this browser. Please install the MetaMask extension or use the Autonomous Instant Wallet.');
      return;
    }

    const provider = (window as any).ethereum;

    try {
      // 2. Synchronous call on user click gesture - opens MetaMask popup immediately
      const accounts = await provider.request({ method: 'eth_requestAccounts' });

      if (accounts && accounts.length > 0) {
        const userAddr = accounts[0];
        setCustomWallet(userAddr);
        setShowWalletModal(false);

        db.saveCandidate({
          wallet_address: userAddr,
          name: 'MetaMask Candidate',
          parsed_skills: ['Solidity', 'Next.js', 'EVM', 'BSC'],
        });

        // Try switching to BSC (Chain ID 56 / 0x38) in background
        provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }],
        }).catch((err: any) => console.warn('BSC chain switch note:', err));
      }
    } catch (e: any) {
      console.warn('MetaMask user gesture request failed:', e);
      setErrorMsg(e?.message || 'MetaMask connection request was closed or rejected.');
    }
  };

  const handleConnectSimulated = () => {
    const mockWallet = `0x71C${Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(16)}89A`;
    setCustomWallet(mockWallet);
    db.saveCandidate({
      wallet_address: mockWallet,
      name: 'Oceanic Developer',
      parsed_skills: ['Solidity', 'Next.js', 'Viem', 'Python'],
    });
    setShowWalletModal(false);
  };

  const handleDisconnect = () => {
    if (isConnected) disconnect();
    setCustomWallet(null);
  };

  return (
    <>
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

            {isWalletActive ? (
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-abyss-900 border border-cyan-500/30 flex items-center gap-2 text-sm text-gray-200">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono">{formatAddress(activeWallet)}</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  title="Disconnect Wallet"
                  className="p-2 rounded-xl bg-abyss-900 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-cyan-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setErrorMsg(null); setShowWalletModal(true); }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-abyss-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
              >
                <Wallet className="w-4 h-4 text-abyss-950" />
                Connect Web3 Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Web3 Wallet Connector Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
            
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" /> Connect Web3 Wallet
              </h3>
              <button onClick={() => setShowWalletModal(false)} className="text-gray-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleConnectInjected}
                className="w-full p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-500/50 flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    🦊
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-cyan-400">
                      MetaMask / Injected Wallet
                    </div>
                    <div className="text-xs text-gray-400">Instant direct browser popup trigger</div>
                  </div>
                </div>
                <Zap className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={handleConnectSimulated}
                className="w-full p-4 rounded-2xl glass-card border border-teal-500/20 hover:border-teal-500/50 flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-teal-300">Autonomous Instant EVM Wallet</div>
                    <div className="text-xs text-gray-400">1-Click instant Web3 connection</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 text-center">
              Target Chain: BNB Smart Chain (Chain ID: 56) • BEP20 USDT
            </p>

          </div>
        </div>
      )}
    </>
  );
}
