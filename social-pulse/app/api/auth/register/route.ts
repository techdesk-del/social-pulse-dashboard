import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../../lib/db/mongodb';
import User from '../../../../lib/db/models/User';
import WeekEntry from '../../../../lib/db/models/WeekEntry';
import { signToken, TOKEN_COOKIE_NAME } from '../../../../lib/auth-server';
import { SEED_WEEKS } from '../../../../lib/constants';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Please provide all required fields.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json({ ok: false, error: 'An account with this email already exists.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // Seed default initial demo weeks for newly registered user
    try {
      const seedEntries = SEED_WEEKS.map((sw) => ({
        userId: user._id,
        weekId: sw.weekId,
        linkedin: sw.linkedin,
        instagram: sw.instagram,
        facebook: sw.facebook,
      }));
      await WeekEntry.insertMany(seedEntries);
    } catch {
      // Ignore seed errors if any
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
    console.error('Registration API error:', err);
    const errorDetails = err instanceof Error ? err.message : 'Database error during registration.';
    return NextResponse.json({ ok: false, error: errorDetails }, { status: 500 });
  }
}
