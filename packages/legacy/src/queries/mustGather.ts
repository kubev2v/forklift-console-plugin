import { usePollingContext } from 'legacy/src/common/context';
import { useQueryClient } from 'react-query';
import { useMockableQuery, useMockableMutation, getMustGatherApiUrl } from './helpers';
import { IMustGatherResponse } from 'legacy/src/client/types';
import { MOCK_MUST_GATHERS } from 'legacy/src/queries/mocks/mustGather.mock';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

// triggers a single must gather execution
export const useMustGatherMutation = (
  url: string,
  onSuccess?: (data: IMustGatherResponse) => void,
  onError?: (error: unknown) => void
) => {
  const queryClient = useQueryClient();

  const result = useMockableMutation<IMustGatherResponse>(
    async (options) => {
      return new Promise((res, rej) => {
        consoleFetchJSON(getMustGatherApiUrl(url), 'POST', { body: JSON.stringify(options) })
          .then((mustGatherData) => {
            res(mustGatherData.json());
          })
          .catch((error) => {
            rej({
              result: 'error',
              error: error,
            });
          });
      });
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['must-gather-list']);
        onSuccess && onSuccess(data);
      },
      onError: (error) => {
        onError && onError(error);
      },
    }
  );
  return result;
};

// get all must gathers
export const useMustGathersQuery = (
  url: string,
  isReady: boolean,
  onSuccess?: (data: IMustGatherResponse[]) => void,
  onError?: (error: Response) => void
) => {
  const result = useMockableQuery<IMustGatherResponse[], Response>(
    {
      queryKey: ['must-gather-list'],
      queryFn: async () => await consoleFetchJSON(getMustGatherApiUrl(url)),
      enabled: isReady,
      refetchInterval: usePollingContext().refetchInterval,
      onError: (error) => {
        onError && onError(error);
      },
      onSuccess: (data) => {
        onSuccess && onSuccess(data);
      },
    },
    MOCK_MUST_GATHERS
  );
  return result;
};

// monitor a single must gather
export const useMustGatherQuery = (
  customName: string,
  completed: boolean,
  onSuccess?: (data: IMustGatherResponse) => void,
  onError?: () => void
) => {
  const shouldPoll = !!customName && !completed;

  const result = useMockableQuery<IMustGatherResponse, Response>(
    {
      queryKey: ['must-gather-entity', customName],
      queryFn: async () => await consoleFetchJSON(getMustGatherApiUrl(`must-gather/${customName}`)),
      enabled: shouldPoll,
      refetchInterval: usePollingContext().refetchInterval,
      onError: () => {
        onError && onError();
      },
      onSuccess: (data) => {
        onSuccess && onSuccess(data);
      },
    },
    MOCK_MUST_GATHERS[0]
  );
  return result;
};
