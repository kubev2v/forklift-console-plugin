import { useEffect, useRef } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import { GeneralFormFieldId } from '../steps/general-information/constants';
import type { CreatePlanFormData } from '../types';

/**
 * Resolves a source provider by name via K8s API and sets it on the form.
 */
export const useSourceProviderFromSearchParams = (
  setValue: UseFormSetValue<CreatePlanFormData>,
  sourceProviderName: string | undefined,
  planProject: string | undefined,
): void => {
  const shouldWatch = Boolean(sourceProviderName && planProject);

  const [providers, loaded] = useK8sWatchResource<V1beta1Provider[]>(
    shouldWatch
      ? { groupVersionKind: ProviderModelGroupVersionKind, isList: true, namespace: planProject }
      : null,
  );

  const hasSetProvider = useRef(false);

  useEffect(() => {
    if (!sourceProviderName || hasSetProvider.current || !loaded) return;

    const matched = isEmpty(providers)
      ? undefined
      : providers.find((provider) => getName(provider) === sourceProviderName);

    if (matched) {
      setValue(GeneralFormFieldId.SourceProvider, matched);
      hasSetProvider.current = true;
    }
  }, [sourceProviderName, loaded, providers, setValue]);
};
