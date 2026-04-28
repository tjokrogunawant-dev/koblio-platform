import { type ImgHTMLAttributes, type HTMLAttributes, forwardRef, useState } from 'react';
import { cn } from './cn';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses: Record<string, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-xl',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Avatar.displayName = 'Avatar';

const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
      return null;
    }

    return (
      <img
        ref={ref}
        alt={alt}
        className={cn('aspect-square h-full w-full object-cover', className)}
        onError={() => setHasError(true)}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-bold',
        className,
      )}
      {...props}
    />
  ),
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
