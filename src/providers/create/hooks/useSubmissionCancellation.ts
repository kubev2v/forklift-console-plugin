import { useCallback, useEffect, useRef } from 'react';

type SubmissionCancellation = {
  cancelCurrentSubmission: () => void;
  isSubmissionCancelled: (submissionId: number) => boolean;
  startSubmission: () => number;
};

/**
 * Tracks cancellation per submission, so a late auto-detection result from a cancelled submission is
 * ignored while a submission started after Cancel (which can leave the form mounted) still runs.
 */
export const useSubmissionCancellation = (): SubmissionCancellation => {
  const latestSubmissionIdRef = useRef(0);
  const cancelledSubmissionIdRef = useRef<number | null>(null);

  useEffect(
    () => (): void => {
      cancelledSubmissionIdRef.current = latestSubmissionIdRef.current;
    },
    [],
  );

  const startSubmission = useCallback((): number => {
    latestSubmissionIdRef.current += 1;
    return latestSubmissionIdRef.current;
  }, []);

  const isSubmissionCancelled = useCallback(
    (submissionId: number): boolean => cancelledSubmissionIdRef.current === submissionId,
    [],
  );

  const cancelCurrentSubmission = useCallback((): void => {
    cancelledSubmissionIdRef.current = latestSubmissionIdRef.current;
  }, []);

  return { cancelCurrentSubmission, isSubmissionCancelled, startSubmission };
};
