import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    return (
      <button ref={ref} className={className} data-variant={variant} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
