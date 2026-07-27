import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { encodeFunctionData, parseUnits } from 'viem';
import { DESTINATION_WALLET, USDT_CONTRACT_ADDRESS, USDT_ABI, TARGET_CHAIN } from '../lib/web3Config';

export function useUsdtPayment() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  /**
   * Execute BEP20 USDT Transfer on BNB Smart Chain
   * @param amountUsdt Amount in USDT (300 for Job Post, 10 for Candidate Boost)
   */
  const executePayment = async (amountUsdt: number): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error('Please connect your Web3 wallet to proceed.');
      }

      // Check if wallet is connected to BNB Smart Chain (Chain ID 56)
      if (chainId !== TARGET_CHAIN.id && switchChainAsync) {
        await switchChainAsync({ chainId: TARGET_CHAIN.id });
      }

      // USDT standard has 18 decimals on BSC (BEP20)
      const amountInWei = parseUnits(amountUsdt.toString(), 18);

      const txHash = await writeContractAsync({
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'transfer',
        args: [DESTINATION_WALLET, amountInWei],
      });

      return txHash;
    } catch (err: any) {
      console.error('USDT Payment error:', err);
      const errMsg = err?.shortMessage || err?.message || 'Transaction rejected or failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    executePayment,
    loading,
    error,
    isConnected,
    address,
  };
}
