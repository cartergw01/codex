'use client';

import { cn } from '@/lib/utils';

export function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onCheckedChange(!checked)} className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-accent' : 'bg-muted')}>
      <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition', checked ? 'left-6' : 'left-1')} />
    </button>
  );
}
