import { type HTMLAttributes, forwardRef, useEffect, useState, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const toastVariants = cva(
  'pointer-events-auto flex w-full items-center gap-3 rounded-2xl border-2 p-4 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        success: 'border-success bg-success/10 text-foreground',
        destructive: 'border-destructive bg-destructive/10 text-foreground',
        warning: 'border-warning bg-warning/10 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface ToastProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  open?: boolean;
  onClose?: () => void;
  duration?: number;
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, open = true, onClose, duration = 5000, children, ...props }, ref) => {
    const [visible, setVisible] = useState(open);

    const handleClose = useCallback(() => {
      setVisible(false);
      onClose?.();
    }, [onClose]);

    useEffect(() => {
      setVisible(open);
    }, [open]);

    useEffect(() => {
      if (!visible || duration <= 0) return;

      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }, [visible, duration, handleClose]);

    if (!visible) return null;

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex-1">{children}</div>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    );
  },
);
Toast.displayName = 'Toast';

const ToastTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm font-bold', className)} {...props} />
  ),
);
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
);
ToastDescription.displayName = 'ToastDescription';

export { Toast, ToastTitle, ToastDescription, toastVariants };
