import type { FC } from 'react';
import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import { hasLiveMigrationProviderType } from 'src/plans/create/utils/hasLiveMigrationProviderType';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import { PlanModel, type V1beta1Plan } from '@forklift-ui/types';
import { DescriptionList } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';

import usePlanSourceProvider from '../../../../hooks/usePlanSourceProvider';

import ConvertorAffinityDetailsItem from './components/ConvertorAffinity/ConvertorAffinityDetailsItem';
import ConvertorLabelsDetailsItem from './components/ConvertorLabels/ConvertorLabelsDetailsItem';
import ConvertorNodeSelectorDetailsItem from './components/ConvertorNodeSelector/ConvertorNodeSelectorDetailsItem';
import GuestConversionDetailsItem from './components/GuestConversion/GuestConversionDetailsItem';
import NetworkNameTemplateDetailsItem from './components/NetworkNameTemplate/NetworkNameTemplateDetailsItem';
import SharedDisksDetailsItem from './components/PlanMigrateSharedDisks/MigrateSharedDisksDetailsItem';
import TransferNetworkDetailsItem from './components/PlanTransferNetwork/TransferNetworkDetailsItem';
import PreserveClusterCpuModelDetailsItem from './components/PreserveClusterCpuModel/PreserveClusterCpuModelDetailsItem';
import PreserveStaticIPsDetailsItem from './components/PreserveStaticIPs/PreserveStaticIPsDetailsItem';
import PVCNameTemplateDetailsItem from './components/PVCNameTemplate/PVCNameTemplateDetailsItem';
import RootDiskDetailsItem from './components/RootDisk/RootDiskDetailsItem';
import SetLUKSEncryptionPasswordsDetailsItem from './components/SetLUKSEncryptionPasswords/SetLUKSEncryptionPasswordsDetailsItem';
import TargetAffinityDetailsItem from './components/TargetAffinity/TargetAffinityDetailsItem';
import TargetLabelsDetailsItem from './components/TargetLabels/TargetLabelsDetailsItem';
import TargetNodeSelectorDetailsItem from './components/TargetNodeSelector/TargetNodeSelectorDetailsItem';
import TargetPowerStateDetailsItem from './components/TargetPowerState/TargetPowerStateDetailsItem';
import VolumeNameTemplateDetailsItem from './components/VolumeNameTemplate/VolumeNameTemplateDetailsItem';
import XfsCompatibilityDetailsItem from './components/XfsCompatibility/XfsCompatibilityDetailsItem';

type SettingsSectionProps = {
  plan: V1beta1Plan;
};

const SettingsSection: FC<SettingsSectionProps> = ({ plan }) => {
  const { sourceProvider } = usePlanSourceProvider(plan);
  const { isFeatureEnabled } = useFeatureFlags();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace: getNamespace(plan),
  });

  const isVsphere = sourceProvider?.spec?.type === 'vsphere';
  const isOvirt = sourceProvider?.spec?.type === 'ovirt';
  const migrationType = getPlanMigrationType(plan);
  const isVddkInitImageNotSet = isEmpty(sourceProvider?.spec?.settings?.vddkInitImage);

  const isTransferNetworkVisible =
    !hasLiveMigrationProviderType(sourceProvider) ||
    !isFeatureEnabled(FEATURE_NAMES.OCP_LIVE_MIGRATION) ||
    migrationType !== MigrationTypeValue.Live;

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <SetLUKSEncryptionPasswordsDetailsItem
        canPatch={canPatch}
        plan={plan}
        shouldRender={isVsphere}
      />
      <RootDiskDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <SharedDisksDetailsItem
        canPatch={canPatch}
        isVddkInitImageNotSet={isVddkInitImageNotSet}
        plan={plan}
        shouldRender={isVsphere}
      />
      <PVCNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <TransferNetworkDetailsItem
        canPatch={canPatch}
        plan={plan}
        shouldRender={isTransferNetworkVisible}
      />
      <VolumeNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <PreserveStaticIPsDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <NetworkNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <PreserveClusterCpuModelDetailsItem canPatch={canPatch} plan={plan} shouldRender={isOvirt} />
      <XfsCompatibilityDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <GuestConversionDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <TargetPowerStateDetailsItem canPatch={canPatch} plan={plan} />
      <TargetLabelsDetailsItem canPatch={canPatch} plan={plan} />
      <TargetNodeSelectorDetailsItem canPatch={canPatch} plan={plan} />
      <TargetAffinityDetailsItem canPatch={canPatch} plan={plan} />
      <ConvertorLabelsDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <ConvertorNodeSelectorDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <ConvertorAffinityDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
    </DescriptionList>
  );
};

export default SettingsSection;
