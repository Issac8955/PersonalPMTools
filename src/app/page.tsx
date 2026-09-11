import dbConnect from '@/lib/db';
import { Task, Milestone } from '@/models/Schema';
import { AppShell } from '@/components/AppShell';

export const revalidate = 0; // Disable static caching for real-time updates

export default async function HomePage() {
  await dbConnect();

  // Ensure default Inbox milestone exists
  let inbox = await Milestone.findOne({ name: 'Inbox' });
  if (!inbox) {
    inbox = await Milestone.create({ name: 'Inbox', description: 'Default system inbox' });
  }

  // Fetch all tasks and milestones
  const rawTasks = await Task.find({}).lean();
  const rawMilestones = await Milestone.find({}).lean();

  // Convert MongoDB ObjectIDs to clean plain strings for React components
  const tasks = rawTasks.map((t: any) => ({
    ...t,
    _id: t._id.toString(),
    milestoneId: t.milestoneId ? t.milestoneId.toString() : inbox._id.toString(),
    dependencies: (t.dependencies || []).map((d: any) => d.toString()),
    subTasks: (t.subTasks || []).map((st: any) => ({
      ...st,
      _id: st._id.toString(),
    })),
  }));

  const milestones = rawMilestones.map((m: any) => ({
    _id: m._id.toString(),
    name: m.name,
  }));

  return <AppShell tasks={tasks} milestones={milestones} />;
}