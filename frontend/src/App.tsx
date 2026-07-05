import { Link2, MousePointerClick } from 'lucide-react';
import { useEffect } from 'react';
import { EmptyState } from './components/EmptyState/EmptyState';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage';
import { JobDetails } from './components/JobDetails/JobDetails';
import { JobForm } from './components/JobForm/JobForm';
import { JobList } from './components/JobList/JobList';
import { Loading } from './components/Loading/Loading';
import { usePolling } from './hooks/usePolling';
import { useJobsStore } from './store/jobsStore';

function App() {
  const jobs = useJobsStore((state) => state.jobs);
  const activeJob = useJobsStore((state) => state.activeJob);
  const loading = useJobsStore((state) => state.loading);
  const error = useJobsStore((state) => state.error);
  const fetchJobs = useJobsStore((state) => state.fetchJobs);
  const selectJob = useJobsStore((state) => state.selectJob);
  const clearError = useJobsStore((state) => state.clearError);

  usePolling();

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-2">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-4">
        <Link2 className="w-7 h-7 text-blue-500" />
        URLs Checker
      </h1>

      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      <JobForm />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div>
          {loading && jobs.length === 0 ? (
            <Loading message="Загрузка заданий..." />
          ) : (
            <JobList
              jobs={jobs}
              activeJobId={activeJob?.id ?? null}
              onSelect={(id) => void selectJob(id)}
            />
          )}
        </div>

        {jobs.length > 0 && (
          <div>
            {activeJob ? (
              <JobDetails job={activeJob} />
            ) : (
              <EmptyState
                title="Задание не выбрано"
                description="Выберите задание из списка или создайте новое"
                icon={MousePointerClick}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
