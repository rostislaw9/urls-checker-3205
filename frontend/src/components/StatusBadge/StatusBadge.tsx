import { JobStatus, UrlStatus } from '../../types';

const jobStatusClass: Record<JobStatus, string> = {
  [JobStatus.PENDING]: 'bg-indigo-100 text-indigo-700',
  [JobStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-800',
  [JobStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
  [JobStatus.FAILED]: 'bg-red-100 text-red-700',
  [JobStatus.CANCELLED]: 'bg-gray-100 text-gray-500',
};

const urlStatusClass: Record<UrlStatus, string> = {
  [UrlStatus.PENDING]: 'bg-indigo-100 text-indigo-700',
  [UrlStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-800',
  [UrlStatus.SUCCESS]: 'bg-emerald-100 text-emerald-700',
  [UrlStatus.ERROR]: 'bg-red-100 text-red-700',
  [UrlStatus.CANCELLED]: 'bg-gray-100 text-gray-500',
};

const jobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.PENDING]: 'В очереди',
  [JobStatus.IN_PROGRESS]: 'Выполняется',
  [JobStatus.COMPLETED]: 'Завершено',
  [JobStatus.FAILED]: 'Ошибка',
  [JobStatus.CANCELLED]: 'Отменено',
};

const urlStatusLabels: Record<UrlStatus, string> = {
  [UrlStatus.PENDING]: 'В очереди',
  [UrlStatus.IN_PROGRESS]: 'Выполняется',
  [UrlStatus.SUCCESS]: 'Успешно',
  [UrlStatus.ERROR]: 'Ошибка',
  [UrlStatus.CANCELLED]: 'Отменено',
};

export function StatusBadge({
  status,
  type = 'job',
}: {
  status: JobStatus | UrlStatus;
  type?: 'job' | 'url';
}) {
  const isJob = type === 'job';
  const className = isJob
    ? jobStatusClass[status as JobStatus]
    : urlStatusClass[status as UrlStatus];
  const label = isJob ? jobStatusLabels[status as JobStatus] : urlStatusLabels[status as UrlStatus];

  return (
    <span
      className={`inline-block w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
