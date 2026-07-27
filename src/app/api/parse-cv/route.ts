import { NextResponse } from 'next/server';
import { AIEngine } from '../../../lib/aiEngine';

export async function POST(req: Request) {
  try {
    const { rawCv } = await req.json();

    if (!rawCv || typeof rawCv !== 'string') {
      return NextResponse.json({ success: false, error: 'Raw resume text is required' }, { status: 400 });
    }

    const parsed = await AIEngine.parseResume(rawCv);
    return NextResponse.json({ success: true, parsed });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
