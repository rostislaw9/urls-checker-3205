import type { UrlItem } from '../../types';
import { StatusBadge } from '../StatusBadge/StatusBadge';

export function UrlRow({ item }: { item: UrlItem }) {
  const duration =
    item.durationMs != null
      ? item.durationMs >= 1000
        ? `${(item.durationMs / 1000).toFixed(1)}s`
        : `${item.durationMs}ms`
      : '—';

  return (
    <div className="grid grid-cols-[1fr_100px_80px_80px_180px] items-center gap-3 px-3 py-2.5 border-b border-gray-200 text-sm last:border-b-0">
      <span
        className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-800"
        title={item.url}
      >
        {item.url}
      </span>
      <StatusBadge status={item.status} type="url" />
      <span className="text-center font-mono font-semibold">{item.httpStatus ?? '—'}</span>
      <span className="text-right text-gray-500 font-mono">{duration}</span>
      <span
        className={`text-xs overflow-hidden text-ellipsis whitespace-nowrap ${
          item.error ? 'text-red-600' : 'text-gray-400'
        }`}
        title={item.error ?? ''}
      >
        {item.error ?? '—'}
      </span>
    </div>
  );
}
