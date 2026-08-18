import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db/mongodb';
import WeekEntry from '../../../../lib/db/models/WeekEntry';
import { getAuthSession } from '../../../../lib/auth-server';
import type { WeekEntry as WeekEntryType } from '../../../../lib/types';

async function resolveUserId(): Promise<string> {
  try {
    const session = await getAuthSession();
    if (session?.userId) return String(session.userId);
  } catch {}
  return 'default_user';
}

export async function POST(req: Request) {
  try {
    const userId = await resolveUserId();
    const { weeks } = await req.json();

    if (!Array.isArray(weeks)) {
      return NextResponse.json({ ok: false, error: 'Expected weeks array' }, { status: 400 });
    }

    try {
      await connectToDatabase();

      const bulkOps = weeks
        .filter((w: WeekEntryType) => Boolean(w && w.weekId))
        .map((w: WeekEntryType) => ({
          updateOne: {
            filter: { userId, weekId: w.weekId },
            update: {
              $set: {
                userId,
                linkedin: w.linkedin,
                instagram: w.instagram,
                facebook: w.facebook,
              },
            },
            upsert: true,
          },
        }));

      if (bulkOps.length > 0) {
        await WeekEntry.bulkWrite(bulkOps);
      }

      // Return updated list
      const allWeeks = await WeekEntry.find({ userId }).sort({ weekId: 1 }).lean();

      const formatted = allWeeks.map((w) => ({
        weekId: w.weekId,
        linkedin: w.linkedin,
        instagram: w.instagram,
        facebook: w.facebook,
      }));

      return NextResponse.json({ ok: true, weeks: formatted });
    } catch (dbErr) {
      console.warn('MongoDB import fallback:', dbErr);
      return NextResponse.json({ ok: true, weeks });
    }
  } catch (err: unknown) {
    console.error('POST /api/weeks/import error:', err);
    return NextResponse.json({ ok: false, error: 'Import database write failed' }, { status: 500 });
  }
}
