import { NextResponse } from 'next/server';
import { TOKEN_COOKIE_NAME } from '../../../../lib/auth-server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
