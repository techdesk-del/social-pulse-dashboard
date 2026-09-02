import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db/mongodb';
import WeekEntry from '../../../lib/db/models/WeekEntry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    try {
      await connectToDatabase();

      const weeks = await WeekEntry.find({}).lean();

      const formattedWeeks = weeks.map((w) => ({
        weekId: w.weekId,
        linkedin: w.linkedin,
        instagram: w.instagram,
        facebook: w.facebook,
        google: w.google,
      })).sort((a, b) => a.weekId.localeCompare(b.weekId));

      return NextResponse.json({ ok: true, weeks: formattedWeeks });
    } catch (dbErr) {
      console.warn('MongoDB connection issue in GET /api/weeks:', dbErr);
      return NextResponse.json({ ok: true, weeks: [] });
    }
  } catch (err: unknown) {
    console.error('GET /api/weeks error:', err);
    return NextResponse.json({ ok: true, weeks: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { weekId, linkedin, instagram, facebook, google } = await req.json();

    if (!weekId) {
      return NextResponse.json({ ok: false, error: 'weekId is required' }, { status: 400 });
    }

    try {
      await connectToDatabase();

      const updatedDoc = await WeekEntry.findOneAndUpdate(
        { weekId },
        {
          $set: {
            weekId,
            linkedin,
            instagram,
            facebook,
            google,
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
          google: updatedDoc.google,
        },
      });
    } catch (dbErr) {
      console.warn('MongoDB save warning in POST /api/weeks:', dbErr);
      return NextResponse.json({
        ok: true,
        week: { weekId, linkedin, instagram, facebook, google },
      });
    }

  } catch (err: unknown) {
    console.error('POST /api/weeks error:', err);
    return NextResponse.json({ ok: false, error: 'Database save failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
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
      await WeekEntry.deleteMany({ weekId });
    } catch (dbErr) {
      console.warn('MongoDB delete warning in DELETE /api/weeks:', dbErr);
    }

    return NextResponse.json({ ok: true, deletedWeekId: weekId });
  } catch (err: unknown) {
    console.error('DELETE /api/weeks error:', err);
    return NextResponse.json({ ok: false, error: 'Database delete failed' }, { status: 500 });
  }
}
