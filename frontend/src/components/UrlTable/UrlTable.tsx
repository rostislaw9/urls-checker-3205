import { UrlRow } from '../UrlRow/UrlRow';
import type { UrlItem } from '../../types';

export function UrlTable({ urls }: { urls: UrlItem[] }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-[1fr_100px_80px_80px_180px] gap-3 px-3 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span>URL</span>
            <span>Статус</span>
            <span className="text-center">HTTP</span>
            <span className="text-right">Время</span>
            <span>Ошибка</span>
          </div>
          {urls.map((item, index) => (
            <UrlRow key={`${item.url}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
