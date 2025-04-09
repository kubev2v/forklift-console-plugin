import { type FC, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { OpenShiftVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';
import { VSphereVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/VSphereVirtualMachinesList';

import { WizardStepContainer } from '@components/common/WizardStepContainer';
import type { ProviderVirtualMachine } from '@kubev2v/types';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderType } from '../../constants';
import { useCreatePlanFieldWatch, useCreatePlanFormContext } from '../../hooks';
import { GeneralFormFieldId } from '../general-information/constants';

import { VmFormFieldId } from './constants';

export const VirtualMachinesStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(VmFormFieldId.Vms);
  const sourceProvider = useCreatePlanFieldWatch(GeneralFormFieldId.SourceProvider);
  const [vmData, vmDataLoading] = useInventoryVms({ provider: sourceProvider }, true, false);

  const validate = useCallback(
    (value: Record<string, ProviderVirtualMachine[]>) => {
      if (!value || Object.keys(value).length === 0) {
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
          render={({ field }) => {
            const tableProps = {
              initialSelectedIds: field.value ? Object.keys(field.value) : [],
              obj: { provider: sourceProvider, vmData, vmDataLoading },
              onSelect: (selectedVmData: VmData[]) => {
                const selectedVms = selectedVmData?.reduce(
                  (acc: Record<string, ProviderVirtualMachine>, data) => ({
                    ...acc,
                    [data.vm.id]: data.vm,
                  }),
                  {},
                );

                field.onChange(selectedVms);
              },
              showActions: false,
              title: '',
            };

            switch (sourceProvider?.spec?.type) {
              case ProviderType.Openshift:
                return <OpenShiftVirtualMachinesList {...tableProps} />;
              case ProviderType.Openstack:
                return <OpenStackVirtualMachinesList {...tableProps} />;
              case ProviderType.Ovirt:
                return <OVirtVirtualMachinesList {...tableProps} />;
              case ProviderType.Ova:
                return <OvaVirtualMachinesList {...tableProps} />;
              case ProviderType.Vsphere:
                return <VSphereVirtualMachinesList {...tableProps} />;
              case undefined:
              default:
                return <></>;
            }
          }}
        />
      </Stack>
    </WizardStepContainer>
  );
};

export default VirtualMachinesStep;
