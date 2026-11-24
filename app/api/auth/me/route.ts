import { NextResponse } from 'next/server';
import { getAuthSession } from '../../../../lib/auth-server';

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ ok: false, session: null });
  }
  return NextResponse.json({ ok: true, session });
}
