'use client';

import React, { useState } from 'react';
import { TaskProps } from './TaskCard';
import { BoardView } from './BoardView';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';
import { SettingsModal } from './SettingsModal';
import { NewTaskModal } from './NewTaskModal';
import { NewMilestoneModal } from './NewMilestoneModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutGrid,
  ListFilter,
  Calendar,
  Kanban,
  Archive,
  LogOut,
  Settings,
  Plus,
  Flag,
} from 'lucide-react';
import { logout } from '@/app/actions';
import { createNewTask } from '@/app/actions';
import { createNewMilestone } from '@/app/actions/createMilestone';

interface MilestoneProps {
  _id: string;
  name: string;
}

interface AppShellProps {
  tasks: TaskProps[];
  milestones: MilestoneProps[];
}

export function AppShell({ tasks, milestones }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'calendar' | 'timeline' | 'archive'>('board');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newMilestoneOpen, setNewMilestoneOpen] = useState(false);

  // Filter tasks based on active view and global milestone filter
  const visibleTasks = tasks.filter((task) => {
    if (activeTab === 'archive') {
      if (!task.isArchived) return false;
    } else {
      if (task.isArchived) return false;
    }

    if (activeTab !== 'archive' && selectedMilestone !== 'all') {
      return (task as any).milestoneId === selectedMilestone;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-foreground">
            <Kanban className="w-5 h-5 text-primary" />
            <span>Personal PM</span>
          </div>

          <nav className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'board' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() => setActiveTab('board')}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Board
            </Button>
            <Button
              variant={activeTab === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() => setActiveTab('list')}
            >
              <ListFilter className="w-3.5 h-3.5" /> List
            </Button>
            <Button
              variant={activeTab === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() => setActiveTab('calendar')}
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </Button>
            <Button
              variant={activeTab === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() => setActiveTab('timeline')}
            >
              <Kanban className="w-3.5 h-3.5" /> Timeline
            </Button>
            <Button
              variant={activeTab === 'archive' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() => setActiveTab('archive')}
            >
              <Archive className="w-3.5 h-3.5" /> Archive
            </Button>
          </nav>
        </div>

        {/* Controls, Milestone Filter & Action Buttons */}
        <div className="flex items-center gap-3">
          {activeTab !== 'archive' && (
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
        )}

          {/* New Milestone Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setNewMilestoneOpen(true)}
          >
            <Flag className="w-3.5 h-3.5" /> New Milestone
          </Button>

          {/* New Task Button */}
          <Button
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setNewTaskOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Settings & Backup"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Sign Out"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </header>

      {/* Main View Surface */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'board' && <BoardView initialTasks={visibleTasks} />}
        {activeTab === 'list' && <ListView tasks={visibleTasks} milestones={milestones} />}
        {activeTab === 'calendar' && <CalendarView tasks={visibleTasks} />}
        {activeTab === 'timeline' && <TimelineView tasks={visibleTasks} />}
        {activeTab === 'archive' && (
          <div className="p-6 max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
              <div>
                <h2 className="text-lg font-bold">Archive Tasks</h2>
                <p className="text-xs text-muted-foreground">
                  Finished or abandoned work removed from active views[cite: 1].
                </p>
              </div>
              <Badge variant="secondary" className="font-mono">
                {visibleTasks.length} Archived Tasks
              </Badge>
            </div>
            <ListView tasks={visibleTasks} milestones={milestones} />
          </div>
        )}
      </main>

      {/* Dialog Modals */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      <NewTaskModal
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        milestones={milestones}
        onTaskCreated={async (taskData) => {
          const res = await createNewTask(taskData);
          if (!res.success) alert('Failed to save task.');
        }}
      />

      <NewMilestoneModal
        open={newMilestoneOpen}
        onOpenChange={setNewMilestoneOpen}
        onMilestoneCreated={async (name) => {
          const res = await createNewMilestone(name);
          if (!res.success) alert('Failed to create milestone.');
        }}
      />
    </div>
  );
}