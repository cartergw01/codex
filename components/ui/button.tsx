import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center rounded-xl text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-accent text-accent-foreground hover:opacity-90',
      ghost: 'hover:bg-muted',
      outline: 'border border-border bg-card hover:bg-muted'
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3',
      icon: 'h-10 w-10'
    }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';
