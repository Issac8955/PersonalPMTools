'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // F9: Download Backup JSON
  const handleExport = () => {
    window.location.href = '/api/backup';
  };

  // F10: Replace Import with Typed Confirmation
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'REPLACE') {
      setMessage({ type: 'error', text: 'Please type REPLACE to confirm database wipe.' });
      return;
    }
    if (!importFile) {
      setMessage({ type: 'error', text: 'Please select a valid JSON backup file.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const fileText = await importFile.text();
      const jsonData = JSON.parse(fileText);

      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Import failed.');
      }

      setMessage({ type: 'success', text: 'Data successfully restored! Reloading page...' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to import backup file.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Workspace Settings & Backup</DialogTitle>
          <DialogDescription>
            Manage full system backups or import existing JSON archives.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Export Section */}
          <div className="space-y-2 border-b pb-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" /> Export Data (JSON)
            </h4>
            <p className="text-xs text-muted-foreground">
              Download a full backup containing all active and archived tasks, sub-tasks, and milestones.
            </p>
            <Button variant="outline" size="sm" onClick={handleExport} className="w-full gap-2 mt-2">
              <Download className="w-3.5 h-3.5" /> Download `.json` Backup
            </Button>
          </div>

          {/* Import Section */}
          <form onSubmit={handleImport} className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
              <Upload className="w-4 h-4" /> Restore Data (Replace-Only)
            </h4>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md space-y-1">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Warning: Destructive Action
              </p>
              <p className="text-[11px] text-muted-foreground">
                Importing will completely wipe current records and replace them with the imported backup.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Select Backup File</Label>
              <Input
                type="file"
                accept=".json"
                className="text-xs h-9 cursor-pointer"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Type REPLACE to confirm</Label>
              <Input
                type="text"
                placeholder="REPLACE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {message && (
              <div
                className={`text-xs p-2.5 rounded flex items-center gap-1.5 font-medium ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                className="w-full"
                disabled={loading || confirmText !== 'REPLACE' || !importFile}
              >
                {loading ? 'Restoring Workspace...' : 'Wipe & Restore Data'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}