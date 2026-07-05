import { StatusBadge } from '../StatusBadge/StatusBadge';
import type { Job } from '../../types';

interface JobListItemProps {
  job: Job;
  active: boolean;
  onClick: () => void;
}

export function JobListItem({ job, active, onClick }: JobListItemProps) {
  const created = new Date(job.createdAt).toLocaleString();

  return (
    <div
      className={`flex items-center justify-between p-3.5 px-4 border rounded-lg cursor-pointer transition-all bg-white ${
        active
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-500 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs text-gray-400 font-mono truncate">{job.id}</span>
        <span className="text-xs text-gray-500">{job.urls.length} URL</span>
        <span className="text-xs text-gray-400">{created}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={job.status} />
      </div>
    </div>
  );
}
