'use client';

import React, { useState, useEffect } from 'react';
import { createNewTask, updateTask, TaskPayload } from '@/app/actions';
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

export interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'UAT' | 'PROD' | 'Done';
  milestoneId?: string | null;
  dueDate?: string | null;
}

interface MilestoneItem {
  _id: string;
  name: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: MilestoneItem[];
  taskToEdit?: TaskItem | null;
}

export function TaskModal({ isOpen, onClose, milestones, taskToEdit }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [status, setStatus] = useState<'To Do' | 'In Progress' | 'UAT' | 'PROD' | 'Done'>('To Do');
  const [milestoneId, setMilestoneId] = useState('all');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(
        taskToEdit.priority === 'Low' || taskToEdit.priority === 'High'
          ? taskToEdit.priority
          : 'Medium'
      );
      setStatus(taskToEdit.status || 'To Do');
      setMilestoneId(taskToEdit.milestoneId ? String(taskToEdit.milestoneId) : 'all');
      setDueDate(
        taskToEdit.dueDate
          ? new Date(taskToEdit.dueDate).toISOString().split('T')[0]
          : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('To Do');
      setMilestoneId('all');
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: TaskPayload = {
      title,
      description,
      priority,
      status,
      milestoneId: milestoneId === 'all' ? null : milestoneId,
      dueDate: dueDate || null,
    };

    let res;
    if (taskToEdit) {
      res = await updateTask(taskToEdit._id, payload);
    } else {
      res = await createNewTask(payload);
    }

    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to save task.');
    }
  };

  // Helper to find display name for the trigger label
  const currentMilestoneName =
    milestoneId === 'all'
      ? 'None'
      : milestones.find((m) => String(m._id) === String(milestoneId))?.name || 'None';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-lg p-6 space-y-4 text-card-foreground">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-semibold text-lg">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Priority
              </label>
              <Select
                value={priority}
                onValueChange={(val) =>
                  setPriority((val as 'Low' | 'Medium' | 'High') ?? 'Medium')
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(val) =>
                  setStatus(
                    (val as 'To Do' | 'In Progress' | 'UAT' | 'PROD' | 'Done') ?? 'To Do'
                  )
                }
              >
                <SelectTrigger className="h-9">
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Milestone
              </label>
              <Select
                value={milestoneId}
                onValueChange={(val) => setMilestoneId(val ?? 'all')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="None">
                    {currentMilestoneName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">None</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={String(m._id)} value={String(m._id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}