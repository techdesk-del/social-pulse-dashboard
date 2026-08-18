import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db/mongodb';
import WeekEntry from '../../../lib/db/models/WeekEntry';
import { getAuthSession } from '../../../lib/auth-server';
import { SEED_WEEKS } from '../../../lib/constants';

async function resolveUserId(): Promise<string> {
  try {
    const session = await getAuthSession();
    if (session?.userId) return String(session.userId);
  } catch {}
  return 'default_user';
}

export async function GET() {
  try {
    const userId = await resolveUserId();

    try {
      await connectToDatabase();

      // Clean up old week entries before July 6th, 2025
      await WeekEntry.deleteMany({ userId, weekId: { $lt: '2025-07-06' } });

      let weeks = await WeekEntry.find({ userId }).sort({ weekId: 1 }).lean();

      // If user has no entries yet, seed initial demo weeks for them
      if (weeks.length === 0) {
        const seedDocs = SEED_WEEKS.map((sw) => ({
          userId,
          weekId: sw.weekId,
          linkedin: sw.linkedin,
          instagram: sw.instagram,
          facebook: sw.facebook,
        }));
        await WeekEntry.insertMany(seedDocs);
        weeks = await WeekEntry.find({ userId }).sort({ weekId: 1 }).lean();
      }

      const formattedWeeks = weeks.map((w) => ({
        weekId: w.weekId,
        linkedin: w.linkedin,
        instagram: w.instagram,
        facebook: w.facebook,
      }));

      return NextResponse.json({ ok: true, weeks: formattedWeeks });
    } catch (dbErr) {
      console.warn('MongoDB connection issue in GET /api/weeks:', dbErr);
      return NextResponse.json({ ok: true, weeks: SEED_WEEKS });
    }
  } catch (err: unknown) {
    console.error('GET /api/weeks error:', err);
    return NextResponse.json({ ok: true, weeks: SEED_WEEKS });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await resolveUserId();
    const { weekId, linkedin, instagram, facebook } = await req.json();

    if (!weekId) {
      return NextResponse.json({ ok: false, error: 'weekId is required' }, { status: 400 });
    }

    try {
      await connectToDatabase();

      const updatedDoc = await WeekEntry.findOneAndUpdate(
        { userId, weekId },
        {
          $set: {
            userId,
            linkedin,
            instagram,
            facebook,
          },
        },
        { upsert: true, new: true, runValidators: false }
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
    } catch (dbErr) {
      console.warn('MongoDB save warning in POST /api/weeks:', dbErr);
      return NextResponse.json({
        ok: true,
        week: { weekId, linkedin, instagram, facebook },
      });
    }
  } catch (err: unknown) {
    console.error('POST /api/weeks error:', err);
    return NextResponse.json({ ok: false, error: 'Database save failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await resolveUserId();
    const { searchParams } = new URL(req.url);
    let weekId = searchParams.get('weekId');

    if (!weekId) {
      try {
        const body = await req.json();
        weekId = body.weekId;
      } catch {}
    }

    if (!weekId) {
      return NextResponse.json({ ok: false, error: 'weekId is required for deletion' }, { status: 400 });
    }

    try {
      await connectToDatabase();
      await WeekEntry.deleteOne({ userId, weekId });
    } catch (dbErr) {
      console.warn('MongoDB delete warning in DELETE /api/weeks:', dbErr);
    }

    return NextResponse.json({ ok: true, deletedWeekId: weekId });
  } catch (err: unknown) {
    console.error('DELETE /api/weeks error:', err);
    return NextResponse.json({ ok: false, error: 'Database delete failed' }, { status: 500 });
  }
}
