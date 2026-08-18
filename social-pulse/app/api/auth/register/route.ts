import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { ok: false, error: 'New user registration is disabled. Please sign in with your authorized credentials.' },
    { status: 403 }
  );
}
