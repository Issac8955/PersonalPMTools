'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard, TaskProps } from './TaskCard';

interface BoardColumnProps {
  id: string;
  title: string;
  color?: string;
  tasks: TaskProps[];
}

export function BoardColumn({ id, title, color, tasks }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full space-y-2">
      {/* Column Header - Rendered ONCE here */}
      <div className="p-2.5 border-b border-border/40 flex items-center justify-between bg-card/80 rounded-lg">
        <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${color || 'bg-muted text-foreground'}`}>
          {title}
        </span>
        <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Task Cards Drop Area */}
      <div className="flex-1 space-y-2 min-h-[150px]">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}