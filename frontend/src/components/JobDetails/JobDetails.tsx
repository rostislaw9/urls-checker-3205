import { Table, XCircle } from 'lucide-react';
import { useJobsStore } from '../../store/jobsStore';
import type { Job } from '../../types';
import { JobStatus, UrlStatus } from '../../types';
import { JobProgress } from '../JobProgress/JobProgress';
import { StatCard } from '../StatCard/StatCard';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { UrlTable } from '../UrlTable/UrlTable';

export function JobDetails({ job }: { job: Job }) {
  const cancelJob = useJobsStore((state) => state.cancelJob);
  const polling = useJobsStore((state) => state.polling);

  const canCancel =
    job.status !== JobStatus.COMPLETED &&
    job.status !== JobStatus.CANCELLED &&
    job.status !== JobStatus.FAILED;

  const successCount = job.urls.filter((u) => u.status === UrlStatus.SUCCESS).length;
  const errorCount = job.urls.filter((u) => u.status === UrlStatus.ERROR).length;
  const pendingCount = job.urls.filter(
    (u) => u.status === UrlStatus.PENDING || u.status === UrlStatus.IN_PROGRESS,
  ).length;
  const cancelledCount = job.urls.filter((u) => u.status === UrlStatus.CANCELLED).length;

  const created = new Date(job.createdAt).toLocaleString();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Детали задания</h2>
            <StatusBadge status={job.status} />
            {polling && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-500">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                опрос
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 font-mono">{job.id}</span>
          <span className="text-xs text-gray-400">{created}</span>
        </div>
        {canCancel && (
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-red-600"
            onClick={() => void cancelJob(job.id)}
          >
            <XCircle className="w-4 h-4" />
            Отменить задание
          </button>
        )}
      </div>

      <JobProgress job={job} />

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <StatCard value={successCount} label="Успешно" />
        <StatCard value={errorCount} label="Ошибки" />
        <StatCard value={pendingCount} label="Ожидают" />
        <StatCard value={cancelledCount} label="Отменены" />
      </div>

      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Table className="w-4 h-4 text-gray-400" />
          Список URL
        </h3>
        <UrlTable urls={job.urls} />
      </div>
    </div>
  );
}
