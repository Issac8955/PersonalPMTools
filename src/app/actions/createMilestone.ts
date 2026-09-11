'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import { Milestone } from '@/models/Schema'; // Adjust path to match your Mongoose model

export async function createNewMilestone(name: string) {
  try {
    if (!name.trim()) {
      return { success: false, error: 'Milestone name is required' };
    }

    await connectToDatabase();

    const createdMilestone = await Milestone.create({
      name: name.trim(),
      createdAt: new Date(),
    });

    revalidatePath('/');

    return {
      success: true,
      milestone: JSON.parse(JSON.stringify(createdMilestone)),
    };
  } catch (error) {
    console.error('Failed to create milestone:', error);
    return { success: false, error: 'Failed to create milestone in database' };
  }
}