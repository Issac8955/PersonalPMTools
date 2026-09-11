import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Task, Milestone } from '@/models/Schema';

// Export Backup (GET)
export async function GET() {
  await dbConnect();
  const milestones = await Milestone.find({}).lean();
  const tasks = await Task.find({}).lean();

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    milestones,
    tasks,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename=pm-backup-${Date.now()}.json`,
    },
  });
}

// Import Backup (POST - Replace mode)
export async function POST(req: Request) {
  await dbConnect();
  try {
    const { milestones, tasks } = await req.json();

    if (!Array.isArray(milestones) || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    // Wipe existing data
    await Milestone.deleteMany({});
    await Task.deleteMany({});

    // Import replace
    if (milestones.length > 0) await Milestone.insertMany(milestones);
    if (tasks.length > 0) await Task.insertMany(tasks);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}