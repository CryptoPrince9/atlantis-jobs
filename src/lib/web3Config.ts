import { createConfig, http, injected } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { parseUnits, formatUnits } from 'viem';

export const TARGET_CHAIN = bsc; // Chain ID 56 (BNB Smart Chain)
export const DESTINATION_WALLET = '0xe2f8d466ba2031335d1291bc058d85aa050114ec' as `0x${string}`;
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955' as `0x${string}`;

export const JOB_POST_COST_USDT = 300;
export const CANDIDATE_BOOST_COST_USDT = 10;

export const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [injected()],
  transports: {
    [bsc.id]: http(process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'),
  },
});

export { parseUnits, formatUnits };
