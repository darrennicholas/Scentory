export function LoadingSkeleton({ label = 'Loading', variant = 'cards' }: { label?: string; variant?: 'cards' | 'detail' }) {
  if (variant === 'detail') return <div className="skeleton-detail" role="status" aria-label={label}>
    <span className="sr-only">{label}…</span>
    <div className="skeleton-detail__image" />
    <div className="skeleton-detail__content"><div className="skeleton-line short" /><div className="skeleton-line title" /><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line short" /><div className="skeleton-line panel" /></div>
  </div>;

  return <div className="skeleton-grid" role="status" aria-label={label}>
    <span className="sr-only">{label}…</span>
    {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-card"><div className="skeleton-image" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}
  </div>;
}
