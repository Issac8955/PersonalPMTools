'use server';

import dbConnect from '@/lib/db';
import { Task, Milestone } from '@/models/Schema';
import { hasDependencyCycle } from '@/lib/dependencies'
import { revalidatePath } from 'next/cache';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';

export type TaskStatus = 'To Do' | 'In Progress' | 'UAT' | 'PROD' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

interface CreateTaskPayload {
  title: string;
  description?: string;
  milestoneId?: string | null;
  priority?: string;
  dueDate?: string | null;
  status?: TaskStatus;
}


const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-env'
);

// --- Auth Actions ---
export async function login(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return { error: 'Invalid password' };
  }

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  // Await cookies() for Next.js 15+ compatibility
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect('/');
}

export async function logout() {
  // Await cookies() for Next.js 15+ compatibility
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}

// --- Task & Data Actions ---
export async function updateTaskStatus(taskId: string, newStatus: string) {
  await dbConnect();
  
  const updateData: any = { status: newStatus };
  if (newStatus === 'To Do') {
    const existing = await Task.findById(taskId);
    if (existing && !existing.addedToTodoListAt) {
      updateData.addedToTodoListAt = new Date();
    }
  }

  await Task.findByIdAndUpdate(taskId, updateData);
  revalidatePath('/');
}

export async function addDependency(taskId: string, prereqId: string) {
  await dbConnect();

  const currentTask = await Task.findById(taskId);
  if (!currentTask) throw new Error('Task not found');

  const proposedDeps = [...currentTask.dependencies.map((id) => id.toString()), prereqId];

  if (await hasDependencyCycle(taskId, proposedDeps)) {
    throw new Error('Adding this dependency creates a cyclic loop.');
  }

  await Task.findByIdAndUpdate(taskId, { $addToSet: { dependencies: prereqId } });
  revalidatePath('/');
}

export async function toggleSubTask(taskId: string, subTaskId: string, completed: boolean) {
  await dbConnect();
  await Task.updateOne(
    { _id: taskId, 'subTasks._id': subTaskId },
    { $set: { 'subTasks.$.completed': completed } }
  );
  revalidatePath('/');
}

export async function archiveTask(taskId: string) {
  await dbConnect();
  await Task.findByIdAndUpdate(taskId, { isArchived: true });
  revalidatePath('/');
}

export async function restoreTask(taskId: string) {
  await dbConnect();
  await Task.findByIdAndUpdate(taskId, { isArchived: false });
  revalidatePath('/');
}

export async function createNewTask(taskData: CreateTaskPayload) {
  try {
    await connectToDatabase();

    // Map priority safely to match schema enum
    let safePriority: TaskPriority = 'Medium';
    if (taskData.priority === 'Low' || taskData.priority === 'Medium' || taskData.priority === 'High') {
      safePriority = taskData.priority;
    }

    const createdTask = await Task.create({
      title: taskData.title,
      description: taskData.description,
      milestoneId: taskData.milestoneId ? taskData.milestoneId : undefined,
      priority: safePriority,
      dueDate: taskData.dueDate ? taskData.dueDate : undefined,
      // Fix 1: Directly fallback to 'To Do' without illegal string comparison
      status: taskData.status ?? 'To Do',
      isArchived: false,
      // Fix 2: Removed createdAt because Mongoose schema manages timestamps automatically
    });

    revalidatePath('/');

    return { success: true, task: JSON.parse(JSON.stringify(createdTask)) };
  } catch (error) {
    console.error('Failed to create task in DB:', error);
    return { success: false, error: 'Failed to create task' };
  }
}