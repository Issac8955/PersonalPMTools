'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kanban, ArrowRight, Lock, ShieldCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginAction(password);

      if (res.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(res.error || 'Invalid password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Column: Visual Brand Showcase */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted/30 border-r relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Kanban className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Personal PM
          </span>
        </div>

        <div className="space-y-6 max-w-md relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Password-Protected Workspace
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Focus on what matters most today.
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your high-efficiency personal command center. Seamlessly switch between dynamic Kanban boards, 14-day Gantt timelines, and milestone tracking.
          </p>
        </div>

        <div className="text-xs text-muted-foreground relative z-10">
          © {new Date().getFullYear()} Personal PM. Secured local environment.
        </div>
      </div>

      {/* Right Column: Single Password Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[380px] space-y-6">
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Kanban className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Personal PM</span>
          </div>

          <div className="space-y-2 text-left">
            <div className="p-2.5 w-fit rounded-xl bg-primary/10 text-primary mb-2">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Admin Access
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter your master password to unlock your personal workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Admin Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-xs focus-visible:ring-primary/40"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-[11px] font-medium text-destructive bg-destructive/10 p-2 rounded-md">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-10 font-semibold gap-2 text-xs shadow-md shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                'Unlocking...'
              ) : (
                <>
                  Unlock Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t text-center">
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-500" />
              Protected by SSO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}