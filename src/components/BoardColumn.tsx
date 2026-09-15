import React from 'react';
import { TaskCard, TaskProps } from './TaskCard';

export interface BoardColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: TaskProps[];
  onTaskClick?: (task: TaskProps) => void; // Added onTaskClick prop
}

export function BoardColumn({ id, title, color, tasks, onTaskClick }: BoardColumnProps) {
  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold ${color}`}>
        <span>{title}</span>
        <span className="bg-background/80 px-2 py-0.5 rounded-full text-[10px]">
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task._id}
            onClick={() => onTaskClick?.(task)}
            className="cursor-pointer"
          >
            <TaskCard task={task} />
          </div>
        ))}
      </div>
    </div>
  );
}