'use client';

import React, { useState, useMemo } from 'react';
import { TaskProps } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  tasks: TaskProps[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Map tasks to dates (only tasks with dates)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskProps[]>();

    tasks.forEach((task) => {
      if (task.isArchived) return;

      const dateStr = task.dueDate || task.startDate;
      if (!dateStr) return;

      const existing = map.get(dateStr) || [];
      map.set(dateStr, [...existing, task]);
    });

    return map;
  }, [tasks]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const todayMonth = () => setCurrentMonth(new Date());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={todayMonth}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b text-center text-xs font-semibold py-2 bg-muted/50 text-muted-foreground">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y border-b text-sm">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(dateKey) || [];
            const isSelectedMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dateKey}
                className={`min-h-[110px] p-1.5 transition-colors ${
                  !isSelectedMonth ? 'bg-muted/20 text-muted-foreground/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      isToday
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-1 text-[11px] rounded bg-muted border font-medium truncate flex items-center justify-between gap-1"
                      title={task.title}
                    >
                      <span className="truncate">{task.title}</span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1 py-0 h-4 font-mono uppercase"
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}