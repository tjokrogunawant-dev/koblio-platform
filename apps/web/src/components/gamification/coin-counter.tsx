'use client';

import { useEffect, useRef, useState } from 'react';

interface CoinCounterProps {
  coins: number;
  animated?: boolean;
}

export function CoinCounter({ coins, animated = false }: CoinCounterProps) {
  const [scaled, setScaled] = useState(false);
  const prevCoinsRef = useRef(coins);

  useEffect(() => {
    if (!animated) return;
    if (coins !== prevCoinsRef.current) {
      prevCoinsRef.current = coins;
      setScaled(true);
      const timer = setTimeout(() => setScaled(false), 400);
      return () => clearTimeout(timer);
    }
  }, [coins, animated]);

  return (
    <span
      className={`flex items-center gap-1 font-bold text-yellow-600 transition-transform duration-200 ${
        scaled ? 'scale-125' : 'scale-100'
      }`}
    >
      <span role="img" aria-label="coins">🪙</span>
      <span>{coins.toLocaleString()}</span>
    </span>
  );
}
