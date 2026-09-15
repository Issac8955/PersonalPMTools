'use client';

import React, { useState, useMemo } from 'react';
import { TaskProps } from './TaskCard';
import { updateTaskStatus, archiveTask } from '@/app/actions';
import { calculateDaysInToDo, isTaskOverdue } from '@/lib/dates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Clock, Archive, ArrowUpDown, Search } from 'lucide-react';

interface ListViewProps {
  tasks: TaskProps[];
  milestones: { _id: string; name: string }[];
}

type SortField = 'title' | 'priority' | 'status' | 'dueDate' | 'type';

export function ListView({ tasks, milestones }: ListViewProps) {
  const [search, setSearch] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  // Milestone lookup map
  const milestoneMap = useMemo(() => {
    return new Map(milestones.map((m) => [m._id, m.name]));
  }, [milestones]);

  // Priority weight for sorting
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
        const matchesMilestone =
          selectedMilestone === 'all' || (task as any).milestoneId === selectedMilestone;
        return matchesSearch && matchesMilestone;
      })
      .sort((a, b) => {
        let valA: any = a[sortField] || '';
        let valB: any = b[sortField] || '';

        if (sortField === 'priority') {
          valA = priorityWeight[a.priority];
          valB = priorityWeight[b.priority];
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [tasks, search, selectedMilestone, sortField, sortAsc, priorityWeight]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
              value={selectedMilestone}
              onValueChange={(val) => setSelectedMilestone(val ?? 'all')}
            >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="Milestone: All">
                {selectedMilestone === 'all'
                  ? 'All Milestones'
                  : milestones.find((m) => String(m._id) === String(selectedMilestone))?.name || 'All Milestones'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Milestones</SelectItem>
              {milestones.map((m) => (
                <SelectItem key={String(m._id)} value={String(m._id)}>
                   {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Table */}
      <div className="border rounded-lg overflow-x-auto bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('title')}>
                <div className="flex items-center gap-1">Title <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3">Milestone</th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('type')}>
                <div className="flex items-center gap-1">Type <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('priority')}>
                <div className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('status')}>
                <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('dueDate')}>
                <div className="flex items-center gap-1">Due Date <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="p-3 text-center">Sub-tasks</th>
              <th className="p-3 text-center">Days in To Do</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-muted-foreground">
                  No tasks found matching your filters.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const completedSub = task.subTasks.filter((s) => s.completed).length;
                const totalSub = task.subTasks.length;
                const isOverdue = isTaskOverdue(task.dueDate, task.status);
                const daysInToDo =
                  task.status === 'To Do' && task.addedToTodoListAt
                    ? calculateDaysInToDo(task.addedToTodoListAt)
                    : null;

                return (
                  <tr key={task._id} className="hover:bg-muted/30 transition-colors">
                    {/* Title & Blocked Status */}
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{task.title}</span>
                        {task.isBlocked && (
                          <span title="Prerequisites pending">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Milestone */}
                    <td className="p-3 text-muted-foreground">
                      {milestoneMap.get((task as any).milestoneId) || 'Inbox'}
                    </td>

                    {/* Type */}
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {task.type}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="p-3">
                      <span
                        className={`text-xs font-semibold ${
                          task.priority === 'High'
                            ? 'text-red-500'
                            : task.priority === 'Medium'
                            ? 'text-amber-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Inline Status Dropdown */}
                    <td className="p-3">
                      <Select
                        value={task.status}
                        onValueChange={(newStatus) => {
                            if (newStatus) {
                            updateTaskStatus(task._id, newStatus);
                            }
                        }}
                        >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="UAT">UAT</SelectItem>
                          <SelectItem value="PROD">PROD</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Due Date */}
                    <td className="p-3">
                      {task.dueDate ? (
                        <span className={isOverdue ? 'text-red-500 font-bold' : 'text-muted-foreground'}>
                          {task.dueDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Sub-tasks Ratio */}
                    <td className="p-3 text-center font-mono text-xs text-muted-foreground">
                      {totalSub > 0 ? `${completedSub}/${totalSub}` : '—'}
                    </td>

                    {/* Days in To Do */}
                    <td className="p-3 text-center font-mono text-xs">
                      {daysInToDo !== null ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" /> {daysInToDo}d
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Archive Task"
                        onClick={() => archiveTask(task._id)}
                      >
                        <Archive className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}