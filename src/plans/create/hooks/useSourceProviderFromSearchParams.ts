import { useEffect, useRef } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

import { useProvider } from '@utils/hooks/useProvider';

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
  const { loaded, provider } = useProvider(sourceProviderName, planProject);

  const hasSetProvider = useRef(false);

  useEffect(() => {
    if (!sourceProviderName || hasSetProvider.current || !loaded || !provider?.metadata?.name)
      return;

    setValue(GeneralFormFieldId.SourceProvider, provider);
    hasSetProvider.current = true;
  }, [sourceProviderName, loaded, provider, setValue]);
};
