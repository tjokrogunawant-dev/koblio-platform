import { cn } from '@/lib/utils';

export const AVATAR_MAP: Record<string, string> = {
  fox: '🦊',
  owl: '🦉',
  bear: '🐻',
  penguin: '🐧',
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  dragon: '🐲',
};

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-base',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-20 w-20 text-4xl',
} as const;

interface AvatarProps {
  slug?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  /** Fallback display name initial when no slug is set */
  name?: string;
  className?: string;
}

export function Avatar({ slug, size = 'md', name, className }: AvatarProps) {
  const emoji = slug ? AVATAR_MAP[slug] : undefined;
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full select-none',
        emoji ? 'bg-indigo-50' : 'bg-slate-200 text-slate-600 font-semibold',
        SIZE_CLASSES[size],
        className,
      )}
      aria-label={slug ? `${slug} avatar` : 'no avatar selected'}
    >
      {emoji ?? initial}
    </span>
  );
}
