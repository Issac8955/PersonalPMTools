import { Task } from '@/models/Schema';

export async function hasDependencyCycle(
  taskId: string,
  proposedPrereqIds: string[]
): Promise<boolean> {
  // Prevent self-dependency
  if (proposedPrereqIds.includes(taskId)) return true;

  const visited = new Set<string>();
  const queue = [...proposedPrereqIds];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === taskId) return true; // Cycle detected

    if (!visited.has(currentId)) {
      visited.add(currentId);
      const currentTask = await Task.findById(currentId).lean();
      if (currentTask && currentTask.dependencies) {
        queue.push(...currentTask.dependencies.map((id) => id.toString()));
      }
    }
  }

  return false;
}