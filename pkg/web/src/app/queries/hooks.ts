import * as React from 'react';
import { UseQueryResult } from 'react-query';
import * as yup from 'yup';
import yaml from 'js-yaml';

import { IKubeList } from '@app/client/types';
import { usePollingContext } from '@app/common/context';
import { mockKubeList, sortKubeListByName, useMockableQuery } from './helpers';
import { MOCK_HOOKS } from './mocks/hooks.mock';
import { IHook } from './types';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { createResource, ForkliftResourceKind } from '@app/client/helpers';

export const useHooksQuery = (namespace: string): UseQueryResult<IKubeList<IHook>> => {
  const hookResource = createResource(ForkliftResourceKind.Hook, namespace);
  const sortKubeListByNameCallback = React.useCallback(
    (data): IKubeList<IHook> => sortKubeListByName(data),
    []
  );
  const result = useMockableQuery<IKubeList<IHook>>(
    {
      queryKey: 'hooks',
      queryFn: async () => await consoleFetchJSON(hookResource.listPath()),
      refetchInterval: usePollingContext().refetchInterval,
      select: sortKubeListByNameCallback,
    },
    mockKubeList(MOCK_HOOKS, 'Hook')
  );
  return result;
};

export const playbookSchema = yup
  .string()
  .label('Ansible playbook')
  .test('valid-yaml', 'Playbook must be valid YAML', (value, context) => {
    try {
      yaml.load(value || '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.reason && e.mark) {
        return context.createError({
          message: `Invalid YAML: ${e.reason} (${e.mark.line + 1}:${e.mark.column + 1})`,
        });
      }
      return false;
    }
    return true;
  });
