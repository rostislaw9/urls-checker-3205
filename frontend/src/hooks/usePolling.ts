import { useEffect, useRef } from 'react';
import { useJobsStore, isTerminalStatus } from '../store/jobsStore';
import { jobsApi } from '../api/jobsApi';

const POLL_INTERVAL_MS = 2000;

export function usePolling(): void {
  const activeJob = useJobsStore((state) => state.activeJob);
  const updateActiveJob = useJobsStore((state) => state.updateActiveJob);
  const setPolling = useJobsStore((state) => state.setPolling);

  const activeJobId = activeJob?.id ?? null;
  const activeJobStatus = activeJob?.status ?? null;

  const activeJobIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!activeJobId || !activeJobStatus || isTerminalStatus(activeJobStatus)) {
      setPolling(false);
      activeJobIdRef.current = null;
      return;
    }

    activeJobIdRef.current = activeJobId;
    setPolling(true);

    const poll = async () => {
      const currentId = activeJobIdRef.current;
      if (!currentId) return;

      try {
        const job = await jobsApi.getJob(currentId);

        if (activeJobIdRef.current !== currentId) return;

        updateActiveJob(job);

        if (isTerminalStatus(job.status)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          activeJobIdRef.current = null;
          setPolling(false);
        }
      } catch {
        if (activeJobIdRef.current !== currentId) return;
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      activeJobIdRef.current = null;
      setPolling(false);
    };
  }, [activeJobId, activeJobStatus, updateActiveJob, setPolling]);
}
