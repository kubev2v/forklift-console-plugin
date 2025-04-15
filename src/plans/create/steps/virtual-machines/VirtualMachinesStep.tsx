import { type FC, useCallback } from 'react';
import { Controller } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import type { ProviderVirtualMachine } from '@kubev2v/types';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';

import { VmFormFieldId } from './constants';
import { VirtualMachinesTable } from './VirtualMachinesTable';

export const VirtualMachinesStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(VmFormFieldId.Vms);

  const validate = useCallback(
    (value: Record<string, ProviderVirtualMachine[]>) => {
      if (isEmpty(value) || Object.keys(value).length === 0) {
        return t('Must select at least 1 VM.');
      }

      return true;
    },
    [t],
  );

  return (
    <WizardStepContainer title={t('Virtual machines')} isFullWidth>
      <Stack hasGutter>
        <p>
          {t(
            "Select the virtual machines you want to migrate. To help find the virtual machines you're looking for, try using the filter.",
          )}
        </p>

        {error && <Alert variant={AlertVariant.danger} isInline title={error.message} />}

        <Controller
          name={VmFormFieldId.Vms}
          control={control}
          rules={{ validate }}
          render={({ field }) => <VirtualMachinesTable field={field} />}
        />
      </Stack>
    </WizardStepContainer>
  );
};
