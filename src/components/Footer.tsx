import React from 'react';
import { Waves, ShieldCheck, Compass, Coins } from 'lucide-react';
import { DESTINATION_WALLET } from '../lib/web3Config';

export function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-abyss-950/90 text-gray-400 py-12 mt-20 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Waves className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-base">AtlantisJobs</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Autonomous 24/7 Web3 & AI hiring platform powered by open-source LLM routing and BEP20 USDT smart contract payment verification on BNB Smart Chain.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-cyan-400" /> Smart Contract Specs
          </h4>
          <ul className="space-y-1.5 text-xs font-mono text-gray-400">
            <li>Network: <span className="text-amber-400">BNB Smart Chain (BSC - 56)</span></li>
            <li>Token: <span className="text-teal-400">USDT BEP20</span></li>
            <li>Job Paywall: <span className="text-white">300 USDT</span></li>
            <li>Candidate Boost: <span className="text-white">10 USDT</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" /> Destination Vault Address
          </h4>
          <p className="text-xs font-mono text-cyan-300 break-all bg-abyss-900 p-2.5 rounded-lg border border-cyan-500/20">
            {DESTINATION_WALLET}
          </p>
          <p className="text-[11px] text-gray-500 mt-2">
            100% Free-tier perpetual infrastructure. Zero SaaS fees.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-cyan-500/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
        <p>© 2026 AtlantisJobs Network. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-cyan-400" /> Open-Source Hugging Face & Viem Mesh
        </p>
      </div>
    </footer>
  );
}
