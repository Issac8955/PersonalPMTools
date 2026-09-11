'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Flag, LayoutGrid, Type, AlignLeft } from 'lucide-react';

interface MilestoneProps {
  _id: string;
  name: string;
}

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestones: MilestoneProps[];
  onTaskCreated?: (taskData: any) => Promise<void>;
}

export function NewTaskModal({ open, onOpenChange, milestones, onTaskCreated }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestoneId, setMilestoneId] = useState<string>('none');
  const [priority, setPriority] = useState<string>('Medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const newTaskData = {
      title: title.trim(),
      description: description.trim(),
      milestoneId: milestoneId === 'none' ? null : milestoneId,
      priority,
      dueDate: dueDate || null,
      status: 'To Do',
    };

    try {
      if (onTaskCreated) {
        await onTaskCreated(newTaskData);
      }
      
      setTitle('');
      setDescription('');
      setMilestoneId('none');
      setPriority('Medium');
      setDueDate('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border border-border/80 shadow-2xl rounded-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-primary/10 text-primary">
              <LayoutGrid className="w-4 h-4" />
            </span>
            Create New Task
          </DialogTitle>
        </DialogHeader>

        {/* Form Body - Grid Layout */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Task Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="h-10 text-sm font-medium focus-visible:ring-primary/40"
              required
              autoFocus
            />
          </div>

          {/* Grid Row: Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" /> Priority
              </label>
              <Select value={priority} onValueChange={(val) => setPriority(val ?? 'Medium')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">🟢 Low</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="High">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </label>
              <Input
                type="date"
                className="h-9 text-xs"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Milestone Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" /> Target Milestone
            </label>
            <Select value={milestoneId} onValueChange={(val) => setMilestoneId(val ?? 'none')}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select milestone">
                  {milestoneId === 'none'
                    ? 'None'
                    : milestones.find((m) => String(m._id) === String(milestoneId))?.name || 'Select milestone'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {milestones.map((m) => (
                  <SelectItem key={String(m._id)} value={String(m._id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, notes, or sub-tasks..."
              rows={3}
              className="resize-none text-xs focus-visible:ring-primary/40"
            />
          </div>

          {/* Footer Actions */}
          <DialogFooter className="pt-2 gap-2 border-t mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="px-5 font-semibold">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}