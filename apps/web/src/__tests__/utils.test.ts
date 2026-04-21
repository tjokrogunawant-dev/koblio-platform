import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    const result = cn('px-4', 'px-8');
    expect(result).toBe('px-8');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});
