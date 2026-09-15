'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Archive } from 'lucide-react';
import { toggleSubTask, archiveTask } from '@/app/actions';
import { calculateDaysInToDo, isTaskOverdue } from '@/lib/dates';

interface SubTask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface TaskProps {
  _id: string;
  title: string;
  description?: string;
  type: 'Feature' | 'Bug' | 'Maintenance' | 'Personal';
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'UAT' | 'PROD' | 'Done';
  startDate?: string;
  dueDate?: string;
  subTasks: SubTask[];
  dependencies: string[];
  addedToTodoListAt?: string;
  isBlocked?: boolean;
  isArchived?: boolean;
}

export function TaskCard({ task }: { task: TaskProps }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const completedSubTasks = task.subTasks.filter((st) => st.completed).length;
  const totalSubTasks = task.subTasks.length;
  const isOverdue = isTaskOverdue(task.dueDate, task.status);
  const daysInToDo = task.status === 'To Do' && task.addedToTodoListAt ? calculateDaysInToDo(task.addedToTodoListAt) : null;

  const priorityColors = {
    High: 'bg-red-500',
    Medium: 'bg-amber-500',
    Low: 'bg-slate-400',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} suppressHydrationWarning className="touch-none my-2">
      <Card className="relative overflow-hidden border shadow-sm hover:shadow transition-shadow bg-card">
        {/* Priority Accent Strip */}
        <div className={`absolute top-0 left-0 bottom-0 w-1 ${priorityColors[task.priority]}`} />

        <CardContent className="p-3 pl-4 space-y-2">
          {/* Top Row: Type Pill, Priority Badge & Blocked Indicator */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                {task.type}
              </Badge>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">{task.priority}</span>
            </div>
            {task.isBlocked && (
              <span className="flex items-center text-red-600 dark:text-red-400 font-medium text-[11px]" title="Prerequisites pending">
                <AlertCircle className="w-3.5 h-3.5 mr-0.5" /> Blocked
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-foreground leading-snug">{task.title}</h4>

          {/* Sub-tasks Inline Preview */}
          {totalSubTasks > 0 && (
            <div className="space-y-1 pt-1 border-t text-xs">
              <div className="text-[11px] text-muted-foreground font-medium">
                Sub-tasks ({completedSubTasks}/{totalSubTasks})
              </div>
              {task.subTasks.slice(0, 3).map((st) => (
                <div key={st._id} className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={st.completed}
                    onCheckedChange={(checked) => toggleSubTask(task._id, st._id, !!checked)}
                  />
                  <span className={`text-xs ${st.completed ? 'line-through text-muted-foreground' : ''}`}>{st.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Card Footer: Metadata & Archive */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <div className="flex items-center gap-2">
              {daysInToDo !== null && (
                <span className="flex items-center gap-0.5 font-mono text-amber-600 dark:text-amber-400">
                  <Clock className="w-3 h-3" /> {daysInToDo}d in To Do
                </span>
              )}
              {task.dueDate && (
                <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                  {task.dueDate}
                </span>
              )}
            </div>

            {task.status === 'Done' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="Archive task"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => archiveTask(task._id)}
              >
                <Archive className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}