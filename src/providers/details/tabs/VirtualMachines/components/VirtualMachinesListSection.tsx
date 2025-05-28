import type { FC } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { OpenShiftVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenStackVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OvaVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OVirtVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { VSphereVirtualMachinesList } from 'src/modules/Providers/views/details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { ErrorState } from '@components/common/Page/PageStates';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderVirtualMachinesListProps } from './utils/types';

type VirtualMachinesListSectionProps = {
  providerData: ProviderData;
};

const VirtualMachinesListSection: FC<VirtualMachinesListSectionProps> = ({ providerData }) => {
  const { t } = useForkliftTranslation();

  const tableProps: ProviderVirtualMachinesListProps = {
    obj: providerData,
    showActions: true,
  };

  switch (providerData?.provider?.spec?.type) {
    case PROVIDER_TYPES.openshift:
      return <OpenShiftVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.openstack:
      return <OpenStackVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.ovirt:
      return <OVirtVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.vsphere:
      return <VSphereVirtualMachinesList {...tableProps} />;
    case PROVIDER_TYPES.ova:
      return <OvaVirtualMachinesList {...tableProps} />;
    case undefined:
    default:
      return <ErrorState title={t('Unsupported provider type')} />;
  }
};

export default VirtualMachinesListSection;
