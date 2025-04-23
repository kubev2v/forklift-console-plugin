import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

import TargetNamespaceDetailsItem from './components/PlanTargetNamespace/TargetNamespaceDetailItem';
import TransferNetworkDetailsItem from './components/PlanTransferNetwork/TransferNetworkDetailItem';
import WarmDetailsItem from './components/PlanWarm/WarmDetailItem';
import PreserveClusterCpuModelDetailsItem from './components/PreserveClusterCpuModel/PreserveClusterCpuModelDetailItem';
import usePlanSourceProvider from './hooks/usePlanSourceProvider';

type SettingsSectionProps = {
  plan: V1beta1Plan;
};

const SettingsSection: FC<SettingsSectionProps> = ({ plan }) => {
  const { sourceProvider } = usePlanSourceProvider(plan);

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const isVsphere = sourceProvider?.spec?.type === 'vsphere';
  const isOvirt = sourceProvider?.spec?.type === 'ovirt';
  return (
    <ModalHOC>
      <DescriptionList
        columnModifier={{
          default: '2Col',
        }}
      >
        <WarmDetailsItem plan={plan} canPatch={canPatch} shouldRender={isOvirt || isVsphere} />

        <TransferNetworkDetailsItem plan={plan} canPatch={canPatch} />

        <TargetNamespaceDetailsItem plan={plan} canPatch={canPatch} />

        <PreserveClusterCpuModelDetailsItem
          plan={plan}
          canPatch={canPatch}
          shouldRender={isOvirt}
        />

        {/*{isVsphere && <PreserveStaticIPsDetailsItem resource={plan} canPatch={canPatch} />}

        {isVsphere && <SetLUKSEncryptionPasswordsDetailsItem resource={plan} canPatch={canPatch} />}

        {isVsphere && <RootDiskDetailsItem resource={plan} canPatch={canPatch} />}

        {isVsphere && <SharedDisksDetailsItem resource={plan} canPatch={canPatch} />}

        {isVsphere && <PVCNameTemplateDetailsItem resource={plan} canPatch={canPatch} />}

        {isVsphere && <VolumeNameTemplateDetailsItem resource={plan} canPatch={canPatch} />}

        {isVsphere && <NetworkNameTemplateDetailsItem resource={plan} canPatch={canPatch} />} */}
      </DescriptionList>
    </ModalHOC>
  );
};

export default SettingsSection;
