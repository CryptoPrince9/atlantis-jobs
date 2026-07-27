import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function POST(req: Request) {
  try {
    const { txHash, candidateWallet } = await req.json();

    if (!txHash || !candidateWallet) {
      return NextResponse.json({ success: false, error: 'Missing txHash or candidateWallet' }, { status: 400 });
    }

    const updatedCand = db.saveCandidate({
      wallet_address: candidateWallet,
      is_premium: true,
      premium_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      premium_tx_hash: txHash,
    });

    return NextResponse.json({
      success: true,
      candidate: updatedCand,
      message: '10 USDT Candidate Profile Boost verified and activated for 30 days.',
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
