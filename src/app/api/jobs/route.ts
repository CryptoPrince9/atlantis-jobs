import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET() {
  try {
    const jobs = db.getJobs();
    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, company_name, company_wallet, description, requirements, salary_range, tx_hash } = body;

    if (!title || !company_name || !tx_hash) {
      return NextResponse.json({ success: false, error: 'Missing required fields or 300 USDT tx_hash' }, { status: 400 });
    }

    const newJob = db.addJob({
      title,
      company_name,
      company_wallet: company_wallet || '0xRecruiterWallet',
      description,
      requirements: requirements || [],
      location: body.location || 'Remote',
      salary_range: salary_range || '$120,000 - $160,000 USDT',
      tx_hash,
      payment_amount: 300,
      status: 'active',
    });

    return NextResponse.json({ success: true, job: newJob });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
