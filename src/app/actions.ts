'use server';

import dbConnect from '@/lib/db';
import { Task, Milestone } from '@/models/Schema';
import { hasDependencyCycle } from '@/lib/dependencies';
import { revalidatePath } from 'next/cache';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';

export type TaskStatus = 'To Do' | 'In Progress' | 'UAT' | 'PROD' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskPayload {
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

  const proposedDeps = [...currentTask.dependencies.map((id: any) => id.toString()), prereqId];

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

export async function createNewTask(taskData: TaskPayload) {
  try {
    await connectToDatabase();

    // Map priority strictly to 'Low' | 'Medium' | 'High' accepted by Schema
    let safePriority: 'Low' | 'Medium' | 'High' = 'Medium';
    if (taskData.priority === 'Low' || taskData.priority === 'High') {
      safePriority = taskData.priority;
    }

    const sanitizedMilestoneId =
      taskData.milestoneId && taskData.milestoneId !== 'all'
        ? taskData.milestoneId
        : undefined;

    const createdTask = await Task.create({
      title: taskData.title,
      description: taskData.description || '',
      milestoneId: sanitizedMilestoneId,
      priority: safePriority,
      dueDate: taskData.dueDate ? taskData.dueDate : undefined,
      status: taskData.status ?? 'To Do',
      isArchived: false,
    });

    revalidatePath('/');

    return { success: true, task: JSON.parse(JSON.stringify(createdTask)) };
  } catch (error: any) {
    console.error('Failed to create task in DB:', error);
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

export const createTask = createNewTask;

export async function updateTask(taskId: string, payload: TaskPayload) {
  try {
    await connectToDatabase();

    const title = payload.title?.trim();
    const description = payload.description?.trim() || '';
    
    let safePriority: 'Low' | 'Medium' | 'High' = 'Medium';
    if (payload.priority === 'Low' || payload.priority === 'High') {
      safePriority = payload.priority;
    }

    const status = payload.status || 'To Do';
    const milestoneId =
      payload.milestoneId && payload.milestoneId !== 'all'
        ? payload.milestoneId
        : undefined;
    const dueDate = payload.dueDate ? payload.dueDate : undefined;

    if (!title) {
      return { success: false, error: 'Title is required.' };
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        priority: safePriority,
        status,
        milestoneId,
        dueDate,
      },
      { new: true }
    );

    if (!updatedTask) {
      return { success: false, error: 'Task not found.' };
    }

    revalidatePath('/');

    return {
      success: true,
      task: JSON.parse(JSON.stringify(updatedTask)),
    };
  } catch (error: any) {
    console.error('Error updating task:', error);
    return { success: false, error: error.message || 'Failed to update task.' };
  }
}