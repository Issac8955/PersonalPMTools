'use client';

import React, { useMemo } from 'react';
import { TaskProps } from './TaskCard';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CalendarX } from 'lucide-react';

interface TimelineViewProps {
  tasks: TaskProps[];
}

export function TimelineView({ tasks }: TimelineViewProps) {
  // Separate dated vs undated tasks
  const { datedTasks, undatedCount } = useMemo(() => {
    const dated: TaskProps[] = [];
    let undated = 0;

    tasks.forEach((task) => {
      if (task.isArchived) return;
      if (task.startDate || task.dueDate) {
        dated.push(task);
      } else {
        undated++;
      }
    });

    dated.sort((a, b) => {
      const dateA = a.startDate || a.dueDate || '';
      const dateB = b.startDate || b.dueDate || '';
      return dateA.localeCompare(dateB);
    });

    return { datedTasks: dated, undatedCount: undated };
  }, [tasks]);

  const taskMap = useMemo(() => new Map(tasks.map((t) => [t._id, t])), [tasks]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Undated Banner */}
      {undatedCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs font-medium">
          <CalendarX className="w-4 h-4" />
          <span>
            {undatedCount} task{undatedCount > 1 ? 's' : ''} have no dates assigned and are excluded from the timeline.
          </span>
        </div>
      )}

      {/* Timeline Stream */}
      <div className="border rounded-lg bg-card p-4 shadow-sm space-y-4">
        {datedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No scheduled tasks available to render on the timeline.
          </div>
        ) : (
          datedTasks.map((task) => {
            const hasPrereqs = task.dependencies && task.dependencies.length > 0;

            return (
              <div
                key={task._id}
                className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{task.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {task.type}
                    </Badge>
                    {task.isBlocked && (
                      <span className="flex items-center text-red-500 text-xs font-medium" title="Blocked">
                        <AlertCircle className="w-3.5 h-3.5 mr-0.5" /> Blocked
                      </span>
                    )}
                  </div>

                  {/* Prerequisites Line */}
                  {hasPrereqs && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="font-medium">Depends on:</span>
                      {task.dependencies.map((depId) => {
                        const depTask = taskMap.get(depId);
                        return (
                          <Badge key={depId} variant="secondary" className="text-[10px] py-0">
                            {depTask ? depTask.title : 'Archived Task'}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Date Span Badge */}
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground self-start md:self-auto">
                  <span>{task.startDate || task.dueDate}</span>
                  {task.startDate && task.dueDate && <span>→</span>}
                  {task.startDate && task.dueDate && <span>{task.dueDate}</span>}
                  <Badge variant="secondary" className="ml-2">
                    {task.status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}