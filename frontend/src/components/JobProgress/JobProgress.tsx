import type { Job } from '../../types';
import { UrlStatus } from '../../types';

export function JobProgress({ job }: { job: Job }) {
  const total = job.urls.length;
  const done = job.urls.filter(
    (u) =>
      u.status === UrlStatus.SUCCESS ||
      u.status === UrlStatus.ERROR ||
      u.status === UrlStatus.CANCELLED,
  ).length;

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="my-2">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1.5">
        <span>
          {done} / {total} URL проверено
        </span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}
