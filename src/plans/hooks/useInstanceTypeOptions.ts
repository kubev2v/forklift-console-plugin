import { useMemo } from 'react';
import { NO_INSTANCE_TYPE } from 'src/plans/constants';

import { useForkliftTranslation } from '@utils/i18n';

import { useClusterInstanceTypes } from './useClusterInstanceTypes';

type SelectOption = {
  description: string;
  label: string;
  value: string;
};

type UseInstanceTypeOptionsResult = {
  options: SelectOption[];
  loaded: boolean;
};

export const useInstanceTypeOptions = (): UseInstanceTypeOptionsResult => {
  const { t } = useForkliftTranslation();
  const { instanceTypes, loaded } = useClusterInstanceTypes();

  const options = useMemo(
    (): SelectOption[] => [
      {
        description: t("Keep the VM's original CPU and memory"),
        label: t('None'),
        value: NO_INSTANCE_TYPE,
      },
      ...instanceTypes.map((instanceType) => ({
        description: instanceType.description,
        label: instanceType.name,
        value: instanceType.name,
      })),
    ],
    [instanceTypes, t],
  );

  return { loaded, options };
};
