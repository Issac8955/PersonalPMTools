'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { BoardColumn } from './BoardColumn';
import { TaskCard, TaskProps } from './TaskCard';
import { updateTaskStatus } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, GanttChartSquare, Calendar, Flag } from 'lucide-react';
import { format, addDays, startOfWeek, differenceInDays, isSameDay } from 'date-fns';

const COLUMNS: { id: TaskProps['status']; title: string; color: string }[] = [
  { id: 'To Do', title: 'To Do', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'UAT', title: 'UAT', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'PROD', title: 'PROD', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'Done', title: 'Done', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
];

export function BoardView({ initialTasks }: { initialTasks: TaskProps[] }) {
  const [tasks, setTasks] = useState<TaskProps[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskProps | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban');

  // Sync local state when revalidatePath updates incoming props
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find((t) => t._id === activeId);
    if (!activeTaskItem) return;

    let targetStatus: TaskProps['status'] | null = null;
    if (COLUMNS.some((col) => col.id === overId)) {
      targetStatus = overId as TaskProps['status'];
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && activeTaskItem.status !== targetStatus) {
      setTasks((prev) =>
        prev.map((t) => (t._id === activeId ? { ...t, status: targetStatus! } : t))
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    setActiveTask(null);

    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      await updateTaskStatus(task._id, task.status);
    }
  };

  // Gantt Chart Calculations (14-day rolling window)
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const timelineDays = Array.from({ length: 14 }, (_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background/50">
      {/* View Switcher Controls */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
            {tasks.length} Active Tasks
          </Badge>
        </div>

        <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-lg border border-border/50">
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs gap-1.5 font-medium px-3 shadow-none"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Kanban Board
          </Button>
          <Button
            variant={viewMode === 'gantt' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs gap-1.5 font-medium px-3 shadow-none"
            onClick={() => setViewMode('gantt')}
          >
            <GanttChartSquare className="w-3.5 h-3.5" /> Gantt Timeline
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden p-4">
        {viewMode === 'kanban' ? (
          /* Kanban View */
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full overflow-x-auto pb-2">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.id);
                return (
                  <div
                    key={col.id}
                    className="w-80 flex flex-col rounded-xl bg-card/40 border border-border/60 shadow-sm overflow-hidden flex-shrink-0"
                  >
                    <div className="flex-1 p-2 overflow-y-auto space-y-2">
                      <BoardColumn
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        tasks={columnTasks}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* Screen-Fitting Gantt Chart View */
          <div className="border rounded-xl bg-card shadow-sm overflow-hidden h-full flex flex-col">
            {/* Timeline Days Header */}
            <div className="grid grid-cols-12 border-b bg-muted/40 text-xs font-semibold py-2 px-3 items-center">
              <div className="col-span-3 border-r pr-2 text-muted-foreground truncate">Task Overview</div>
              <div className="col-span-9 grid grid-cols-14 gap-0.5 text-center font-mono text-[10px]">
                {timelineDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`py-1 rounded ${
                      isSameDay(day, new Date())
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div className="text-[9px] uppercase">{format(day, 'EEE')}</div>
                    <div>{format(day, 'd')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Row Items */}
            <div className="divide-y text-xs overflow-y-auto flex-1">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No tasks available for timeline mapping.</div>
              ) : (
                tasks.map((task) => {
                  const taskDueDate = task.dueDate ? new Date(task.dueDate) : addDays(new Date(), 2);
                  const dayOffset = Math.max(0, Math.min(13, differenceInDays(taskDueDate, startDate)));
                  const leftPercent = (dayOffset / 14) * 100;
                  const barSpanPercent = (2 / 14) * 100;

                  return (
                    <div key={task._id} className="grid grid-cols-12 items-center py-2 px-3 hover:bg-muted/20 transition-colors">
                      {/* Sidebar Task Details */}
                      <div className="col-span-3 border-r pr-2 space-y-0.5 truncate">
                        <div className="font-semibold truncate text-foreground text-xs">{task.title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Flag className="w-2.5 h-2.5 text-primary" /> {task.priority || 'Medium'}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" /> {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timeline Bar Track */}
                      <div className="col-span-9 relative h-6 flex items-center px-1">
                        <div
                          className={`absolute h-4 rounded px-1.5 text-[9px] font-medium flex items-center truncate text-white shadow-sm transition-all ${
                            task.status === 'Done'
                              ? 'bg-emerald-500'
                              : task.status === 'In Progress'
                              ? 'bg-blue-500'
                              : 'bg-slate-600'
                          }`}
                          style={{
                            left: `${Math.min(85, leftPercent)}%`,
                            width: `${barSpanPercent}%`,
                          }}
                        >
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}