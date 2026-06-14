import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/lib/banner-generator';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, templates: TEMPLATES });
}
