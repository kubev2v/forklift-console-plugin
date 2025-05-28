import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ErrorState } from '@components/common/Page/PageStates';
import LoadingSuspend from '@components/LoadingSuspend';
import type { V1beta1Provider } from '@kubev2v/types';

import VirtualMachinesListSection from './components/VirtualMachinesListSection';
import { PROVIDER_DETAILS_VMS_TAB_FIELDS } from './utils/constants';

type ProviderVirtualMachinesTabPageProps = {
  provider: V1beta1Provider;
};

const ProviderVirtualMachinesTabPage: FC<ProviderVirtualMachinesTabPageProps> = ({ provider }) => {
  const { t } = useForkliftTranslation();
  const [vmData, vmDataLoading, vmDataError] = useInventoryVms({ provider });
  const { control } = useForm();

  if (vmDataError) {
    return <ErrorState title={t('Unable to retrieve virtual machines data.')} />;
  }

  if (vmDataLoading) {
    return <LoadingSuspend />;
  }

  return (
    <ModalHOC>
      <Controller
        name={PROVIDER_DETAILS_VMS_TAB_FIELDS.vms}
        control={control}
        render={({ field }) => (
          <VirtualMachinesListSection field={field} providerData={{ provider, vmData }} />
        )}
      />
    </ModalHOC>
  );
};

export default ProviderVirtualMachinesTabPage;
