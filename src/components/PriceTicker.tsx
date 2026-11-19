import { useEffect, useState, type ReactNode } from 'react';
import { getPrices, type Prices } from '../lib/api';

// BTC and SOL spot prices for the header. Refreshes every minute and stays quiet if the feed is down.
const STALE_MS = 5 * 60_000;

function compact(n: number): string {
  if (n >= 10_000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BtcIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <text x="16" y="22.500" textAnchor="middle" fontSize="19" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">₿</text>
    </svg>
  );
}

function SolIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="solg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#1a1230" />
      <g fill="url(#solg)">
        <path d="M9 11.500h13.500l2 2.500H11z" />
        <path d="M9 18h13.500l2 2.500H11z" transform="translate(0 -0.500)" />
        <path d="M11 15.200h13.500l-2 2.500H9z" transform="translate(0 -0.200)" />
      </g>
    </svg>
  );
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<Prices | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getPrices()
        .then((p) => alive && setPrices(p))
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!prices || (!prices.btc && !prices.sol)) return null;
  const item = (label: string, p: Prices['btc'], icon: ReactNode, color: string) =>
    p ? (
      <span className="tick" title={`${label} price in USD${Date.now() - p.ts > STALE_MS ? ' (last known, feed is delayed)' : ''}`} style={{ opacity: Date.now() - p.ts > STALE_MS ? 0.55 : 1 }}>
        {icon}
        <span style={{ color }}>{compact(p.usd)}</span>
      </span>
    ) : null;

  return (
    <div className="ticker mono" aria-label="Bitcoin and Solana prices in US dollars">
      {item('Bitcoin', prices.btc, <BtcIcon />, '#F7931A')}
      {item('Solana', prices.sol, <SolIcon />, '#35F0E0')}
    </div>
  );
}
