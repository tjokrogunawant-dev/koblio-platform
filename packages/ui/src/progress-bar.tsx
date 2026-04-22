import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from './cn';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = false,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantClasses[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  },
);
ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
