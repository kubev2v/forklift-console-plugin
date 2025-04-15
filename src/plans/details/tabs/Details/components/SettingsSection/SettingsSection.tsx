import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

import WarmDetailsItem from './components/WarmDetailItem';
import usePlanProviders from './hooks/usePlanProviders';

type SettingsSectionProps = {
  plan: V1beta1Plan;
};

const SettingsSection: FC<SettingsSectionProps> = ({ plan }) => {
  const { sourceProvider } = usePlanProviders(plan);

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

        {/* <TransferNetworkDetailsItem
          resource={plan}
          canPatch={canPatch}
          destinationProvider={destinationProvider}
        />

        <TargetNamespaceDetailsItem
          resource={plan}
          canPatch={canPatch}
          destinationProvider={destinationProvider}
        />

        {isOvirt && <PreserveClusterCpuModelDetailsItem resource={plan} canPatch={canPatch} />}

        {isVsphere && <PreserveStaticIPsDetailsItem resource={plan} canPatch={canPatch} />}

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
