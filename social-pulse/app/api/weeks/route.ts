import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db/mongodb';
import WeekEntry from '../../../lib/db/models/WeekEntry';
import { getAuthSession } from '../../../lib/auth-server';
import { SEED_WEEKS } from '../../../lib/constants';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    let weeks = await WeekEntry.find({ userId: session.userId }).sort({ weekId: 1 }).lean();

    // If user has no entries yet, seed initial demo weeks for them
    if (weeks.length === 0) {
      const seedDocs = SEED_WEEKS.map((sw) => ({
        userId: session.userId,
        weekId: sw.weekId,
        linkedin: sw.linkedin,
        instagram: sw.instagram,
        facebook: sw.facebook,
      }));
      await WeekEntry.insertMany(seedDocs);
      weeks = await WeekEntry.find({ userId: session.userId }).sort({ weekId: 1 }).lean();
    }

    const formattedWeeks = weeks.map((w) => ({
      weekId: w.weekId,
      linkedin: w.linkedin,
      instagram: w.instagram,
      facebook: w.facebook,
    }));

    return NextResponse.json({ ok: true, weeks: formattedWeeks });
  } catch (err: unknown) {
    console.error('GET /api/weeks error:', err);
    return NextResponse.json({ ok: false, error: 'Database fetch failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { weekId, linkedin, instagram, facebook } = await req.json();

    if (!weekId) {
      return NextResponse.json({ ok: false, error: 'weekId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const updatedDoc = await WeekEntry.findOneAndUpdate(
      { userId: session.userId, weekId },
      {
        $set: {
          linkedin,
          instagram,
          facebook,
        },
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      ok: true,
      week: {
        weekId: updatedDoc.weekId,
        linkedin: updatedDoc.linkedin,
        instagram: updatedDoc.instagram,
        facebook: updatedDoc.facebook,
      },
    });
  } catch (err: unknown) {
    console.error('POST /api/weeks error:', err);
    return NextResponse.json({ ok: false, error: 'Database save failed' }, { status: 500 });
  }
}
