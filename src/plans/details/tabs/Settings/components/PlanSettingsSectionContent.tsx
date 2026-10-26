import type { FC, ReactNode } from 'react';

import { DescriptionList } from '@patternfly/react-core';

import ConvertorAffinityDetailsItem from '../../Details/components/SettingsSection/components/ConvertorAffinity/ConvertorAffinityDetailsItem';
import ConvertorLabelsDetailsItem from '../../Details/components/SettingsSection/components/ConvertorLabels/ConvertorLabelsDetailsItem';
import ConvertorNodeSelectorDetailsItem from '../../Details/components/SettingsSection/components/ConvertorNodeSelector/ConvertorNodeSelectorDetailsItem';
import GuestConversionDetailsItem from '../../Details/components/SettingsSection/components/GuestConversion/GuestConversionDetailsItem';
import NetworkNameTemplateDetailsItem from '../../Details/components/SettingsSection/components/NetworkNameTemplate/NetworkNameTemplateDetailsItem';
import SharedDisksDetailsItem from '../../Details/components/SettingsSection/components/PlanMigrateSharedDisks/MigrateSharedDisksDetailsItem';
import TransferNetworkDetailsItem from '../../Details/components/SettingsSection/components/PlanTransferNetwork/TransferNetworkDetailsItem';
import PreserveClusterCpuModelDetailsItem from '../../Details/components/SettingsSection/components/PreserveClusterCpuModel/PreserveClusterCpuModelDetailsItem';
import PreserveStaticIPsDetailsItem from '../../Details/components/SettingsSection/components/PreserveStaticIPs/PreserveStaticIPsDetailsItem';
import PVCNameTemplateDetailsItem from '../../Details/components/SettingsSection/components/PVCNameTemplate/PVCNameTemplateDetailsItem';
import RootDiskDetailsItem from '../../Details/components/SettingsSection/components/RootDisk/RootDiskDetailsItem';
import SetLUKSEncryptionPasswordsDetailsItem from '../../Details/components/SettingsSection/components/SetLUKSEncryptionPasswords/SetLUKSEncryptionPasswordsDetailsItem';
import TargetAffinityDetailsItem from '../../Details/components/SettingsSection/components/TargetAffinity/TargetAffinityDetailsItem';
import TargetLabelsDetailsItem from '../../Details/components/SettingsSection/components/TargetLabels/TargetLabelsDetailsItem';
import TargetNodeSelectorDetailsItem from '../../Details/components/SettingsSection/components/TargetNodeSelector/TargetNodeSelectorDetailsItem';
import TargetPowerStateDetailsItem from '../../Details/components/SettingsSection/components/TargetPowerState/TargetPowerStateDetailsItem';
import VolumeNameTemplateDetailsItem from '../../Details/components/SettingsSection/components/VolumeNameTemplate/VolumeNameTemplateDetailsItem';
import XfsCompatibilityDetailsItem from '../../Details/components/SettingsSection/components/XfsCompatibility/XfsCompatibilityDetailsItem';
import type { PlanSettingsVisibility } from '../hooks/usePlanSettingsVisibility';
import {
  PLAN_SETTINGS_SECTION_ID,
  type PlanSettingsSectionId,
} from '../utils/planSettingsSectionIds';

type PlanSettingsSectionContentProps = {
  sectionId: PlanSettingsSectionId;
  visibility: PlanSettingsVisibility;
};

const PlanSettingsSectionContent: FC<PlanSettingsSectionContentProps> = ({
  sectionId,
  visibility,
}) => {
  const { canPatch, isOvirt, isTransferNetworkVisible, isVddkInitImageNotSet, isVsphere, plan } =
    visibility;

  const renderGuestSection = (): ReactNode => (
    <>
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
      <XfsCompatibilityDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <GuestConversionDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <PreserveClusterCpuModelDetailsItem canPatch={canPatch} plan={plan} shouldRender={isOvirt} />
    </>
  );

  const renderTransferSection = (): ReactNode => (
    <>
      <TransferNetworkDetailsItem
        canPatch={canPatch}
        plan={plan}
        shouldRender={isTransferNetworkVisible}
      />
      <PreserveStaticIPsDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
    </>
  );

  const renderNamingSection = (): ReactNode => (
    <>
      <PVCNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <VolumeNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <NetworkNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
    </>
  );

  const renderTargetSection = (): ReactNode => (
    <>
      <TargetPowerStateDetailsItem canPatch={canPatch} plan={plan} />
      <TargetLabelsDetailsItem canPatch={canPatch} plan={plan} />
      <TargetNodeSelectorDetailsItem canPatch={canPatch} plan={plan} />
      <TargetAffinityDetailsItem canPatch={canPatch} plan={plan} />
    </>
  );

  const renderConvertorSection = (): ReactNode => (
    <>
      <ConvertorLabelsDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <ConvertorNodeSelectorDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <ConvertorAffinityDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
    </>
  );

  const sectionContent = ((): ReactNode => {
    switch (sectionId) {
      case PLAN_SETTINGS_SECTION_ID.Guest:
        return renderGuestSection();
      case PLAN_SETTINGS_SECTION_ID.Transfer:
        return renderTransferSection();
      case PLAN_SETTINGS_SECTION_ID.Naming:
        return renderNamingSection();
      case PLAN_SETTINGS_SECTION_ID.Target:
        return renderTargetSection();
      case PLAN_SETTINGS_SECTION_ID.Convertor:
        return renderConvertorSection();
      default:
        return null;
    }
  })();

  if (sectionContent === null) {
    return null;
  }

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
      data-testid={`plan-settings-section-${sectionId}`}
    >
      {sectionContent}
    </DescriptionList>
  );
};

export default PlanSettingsSectionContent;
