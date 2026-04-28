'use client';

import { Component, type ReactNode } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathErrorBoundaryProps {
  expression: string;
  children: ReactNode;
}

interface MathErrorBoundaryState {
  hasError: boolean;
}

class MathErrorBoundary extends Component<MathErrorBoundaryProps, MathErrorBoundaryState> {
  constructor(props: MathErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MathErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <code className="text-red-500 text-sm">{this.props.expression}</code>;
    }
    return this.props.children;
  }
}

export interface MathRendererProps {
  expression: string;
  display?: boolean;
  className?: string;
}

export function MathRenderer({ expression, display = false, className }: MathRendererProps) {
  return (
    <MathErrorBoundary expression={expression}>
      <span className={className}>
        {display ? <BlockMath math={expression} /> : <InlineMath math={expression} />}
      </span>
    </MathErrorBoundary>
  );
}
