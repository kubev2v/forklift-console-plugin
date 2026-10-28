import type { FC } from 'react';

import NetworkNameTemplateDetailsItem from '../../../Details/components/SettingsSection/components/NetworkNameTemplate/NetworkNameTemplateDetailsItem';
import PVCNameTemplateDetailsItem from '../../../Details/components/SettingsSection/components/PVCNameTemplate/PVCNameTemplateDetailsItem';
import VolumeNameTemplateDetailsItem from '../../../Details/components/SettingsSection/components/VolumeNameTemplate/VolumeNameTemplateDetailsItem';
import type { PlanSettingsVisibility } from '../../hooks/usePlanSettingsVisibility';

type PlanSettingsNamingSectionProps = {
  visibility: PlanSettingsVisibility;
};

const PlanSettingsNamingSection: FC<PlanSettingsNamingSectionProps> = ({ visibility }) => {
  const { canPatch, isVsphere, plan } = visibility;

  return (
    <>
      <PVCNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <VolumeNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <NetworkNameTemplateDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
    </>
  );
};

export default PlanSettingsNamingSection;
