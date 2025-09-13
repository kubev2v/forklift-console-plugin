import type { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useInventoryVms } from 'src/modules/Providers/views/details/tabs/VirtualMachines/utils/hooks/useInventoryVms';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ErrorState } from '@components/common/Page/PageStates';
import LoadingSuspend from '@components/LoadingSuspend';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import VirtualMachinesListSection from './components/VirtualMachinesListSection';
import { PROVIDER_DETAILS_VMS_TAB_FIELDS } from './utils/constants';

const ProviderVirtualMachinesTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);
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
        render={() => (
          <VirtualMachinesListSection providerData={{ provider, vmData, vmDataLoading }} />
        )}
      />
    </ModalHOC>
  );
};

export default ProviderVirtualMachinesTabPage;
