declare module 'react-katex' {
  import { FC, ReactNode } from 'react';

  interface KatexProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: Record<string, unknown>;
  }

  export const InlineMath: FC<KatexProps>;
  export const BlockMath: FC<KatexProps>;
}
