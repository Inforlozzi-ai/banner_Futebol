import { NextResponse } from 'next/server';
import { runDailyBannerJob } from '@/lib/banner-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { date?: string; secret?: string };
    const result = await runDailyBannerJob(body.date);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
