import { useMemo } from 'react';
import { NO_INSTANCE_TYPE } from 'src/plans/constants';

import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import { useForkliftTranslation } from '@utils/i18n';

import { useClusterInstanceTypes } from './useClusterInstanceTypes';

type UseInstanceTypeOptionsResult = {
  loaded: boolean;
  options: TypeaheadSelectOption[];
};

export const useInstanceTypeOptions = (): UseInstanceTypeOptionsResult => {
  const { t } = useForkliftTranslation();
  const { instanceTypes, loaded } = useClusterInstanceTypes();

  const options = useMemo(
    (): TypeaheadSelectOption[] => [
      {
        content: t('None'),
        optionProps: { description: t("Keep the VM's original CPU and memory") },
        value: NO_INSTANCE_TYPE,
      },
      ...instanceTypes.map((instanceType) => ({
        content: instanceType.name,
        optionProps: { description: instanceType.description },
        value: instanceType.name,
      })),
    ],
    [instanceTypes, t],
  );

  return { loaded, options };
};
