import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db/mongodb';
import WeekEntry from '../../../../lib/db/models/WeekEntry';
import type { WeekEntry as WeekEntryType } from '../../../../lib/types';

export async function POST(req: Request) {
  try {
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
            filter: { weekId: w.weekId },
            update: {
              $set: {
                weekId: w.weekId,
                linkedin: w.linkedin,
                instagram: w.instagram,
                facebook: w.facebook,
                google: w.google,
                youtube: w.youtube,
              },
            },
            upsert: true,
          },
        }));

      if (bulkOps.length > 0) {
        await WeekEntry.bulkWrite(bulkOps);
      }

      const allWeeks = await WeekEntry.find({}).sort({ weekId: 1 }).lean();

      const formatted = allWeeks.map((w) => ({
        weekId: w.weekId,
        linkedin: w.linkedin,
        instagram: w.instagram,
        facebook: w.facebook,
        google: w.google,
        youtube: w.youtube,
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
