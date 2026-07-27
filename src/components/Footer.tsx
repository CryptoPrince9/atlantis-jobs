import React from 'react';
import { Bot, ShieldCheck, Cpu, Coins } from 'lucide-react';
import { DESTINATION_WALLET, USDT_CONTRACT_ADDRESS } from '../lib/web3Config';

export function Footer() {
  return (
    <footer className="border-t border-gray-800/80 bg-dark-900/90 text-gray-400 py-12 mt-20 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-white text-base">NexusAI Recruitment</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Autonomous 24/7 Web3 & AI hiring platform powered by open-source LLM routing and BEP20 USDT smart contract payment verification on BNB Smart Chain.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-brand-400" /> Smart Contract Specs
          </h4>
          <ul className="space-y-1.5 text-xs font-mono text-gray-400">
            <li>Network: <span className="text-yellow-400">BNB Smart Chain (BSC - 56)</span></li>
            <li>Token: <span className="text-emerald-400">USDT BEP20</span></li>
            <li>Post Paywall: <span className="text-white">300 USDT</span></li>
            <li>Candidate Boost: <span className="text-white">10 USDT</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Destination Vault
          </h4>
          <p className="text-xs font-mono text-gray-400 break-all bg-dark-800 p-2.5 rounded-lg border border-gray-800">
            {DESTINATION_WALLET}
          </p>
          <p className="text-[11px] text-gray-500 mt-2">
            100% Free-tier perpetual infrastructure. No centralized SaaS fees.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
        <p>© 2026 NexusAI. Autonomous Web3 & AI Recruitment Platform.</p>
        <p className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-brand-400" /> Open-Source Hugging Face & Viem Routing
        </p>
      </div>
    </footer>
  );
}
