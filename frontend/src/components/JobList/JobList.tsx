import { ListChecks } from 'lucide-react';
import type { Job } from '../../types';
import { EmptyState } from '../EmptyState/EmptyState';
import { JobListItem } from '../JobListItem/JobListItem';

interface JobListProps {
  jobs: Job[];
  activeJobId: string | null;
  onSelect: (id: string) => void;
}

export function JobList({ jobs, activeJobId, onSelect }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-2 text-gray-800">
          <ListChecks className="w-5 h-5 text-gray-400" />
          Задания
        </h2>
        <EmptyState title="Заданий нет" description="Создайте задание для проверки URL" />
      </>
    );
  }

  return (
    <>
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-2 text-gray-800">
        <ListChecks className="w-5 h-5 text-gray-400" />
        Задания ({jobs.length})
      </h2>
      <div className="flex flex-col gap-2">
        {jobs.map((job) => (
          <JobListItem
            key={job.id}
            job={job}
            active={job.id === activeJobId}
            onClick={() => onSelect(job.id)}
          />
        ))}
      </div>
    </>
  );
}
