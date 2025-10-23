import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import { hasLiveMigrationProviderType } from 'src/plans/create/utils/hasLiveMigrationProviderType';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';

import { PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';

import usePlanSourceProvider from '../../../../hooks/usePlanSourceProvider';

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
        plan={plan}
        canPatch={canPatch}
        shouldRender={isVsphere}
      />
      <RootDiskDetailsItem plan={plan} canPatch={canPatch} shouldRender={isVsphere} />
      <SharedDisksDetailsItem plan={plan} canPatch={canPatch} shouldRender={isVsphere} />
      <PVCNameTemplateDetailsItem plan={plan} canPatch={canPatch} shouldRender={isVsphere} />
      <TransferNetworkDetailsItem
        plan={plan}
        canPatch={canPatch}
        shouldRender={isTransferNetworkVisible}
      />
      <VolumeNameTemplateDetailsItem plan={plan} canPatch={canPatch} shouldRender={isVsphere} />
      <PreserveStaticIPsDetailsItem plan={plan} canPatch={canPatch} shouldRender={isVsphere} />
      <NetworkNameTemplateDetailsItem plan={plan} canPatch={canPatch} shouldRender={isVsphere} />
      <PreserveClusterCpuModelDetailsItem plan={plan} canPatch={canPatch} shouldRender={isOvirt} />
      <GuestConversionDetailsItem plan={plan} canPatch={canPatch} shouldRender={isVsphere} />
      <TargetPowerStateDetailsItem plan={plan} canPatch={canPatch} />
      <TargetLabelsDetailsItem plan={plan} canPatch={canPatch} />
      <TargetNodeSelectorDetailsItem plan={plan} canPatch={canPatch} />
      <TargetAffinityDetailsItem plan={plan} canPatch={canPatch} />
    </DescriptionList>
  );
};

export default SettingsSection;
