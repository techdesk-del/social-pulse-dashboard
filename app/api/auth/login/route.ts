import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import { signToken, TOKEN_COOKIE_NAME } from '../../../../lib/auth-server';

const AUTHORIZED_EMAIL = 'social@urbangaon.com';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Please enter email and password.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Strict whitelist: only social@urbangaon.com is allowed
    if (normalizedEmail !== AUTHORIZED_EMAIL) {
      return NextResponse.json({ ok: false, error: 'Access restricted to authorized account only.' }, { status: 403 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'No account found with this email.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 400 });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      ok: true,
      session: payload,
    });

    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    console.error('Login API error:', err);
    const errorDetails = err instanceof Error ? err.message : 'Database error during login.';
    return NextResponse.json({ ok: false, error: errorDetails }, { status: 500 });
  }
}
