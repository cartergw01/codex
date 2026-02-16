'use client';

import { X } from 'lucide-react';

export function Modal({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} aria-label="Close modal" />
      {children}
    </div>
  );
}

export function ModalTrigger({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <span onClick={onClick}>{children}</span>;
}

export function ModalContent({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-soft">
      {children}
      <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1 hover:bg-muted" aria-label="Close">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
