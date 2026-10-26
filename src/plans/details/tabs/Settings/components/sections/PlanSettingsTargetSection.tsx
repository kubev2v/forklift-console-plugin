import type { FC } from 'react';

import TargetAffinityDetailsItem from '../../../Details/components/SettingsSection/components/TargetAffinity/TargetAffinityDetailsItem';
import TargetLabelsDetailsItem from '../../../Details/components/SettingsSection/components/TargetLabels/TargetLabelsDetailsItem';
import TargetNodeSelectorDetailsItem from '../../../Details/components/SettingsSection/components/TargetNodeSelector/TargetNodeSelectorDetailsItem';
import TargetPowerStateDetailsItem from '../../../Details/components/SettingsSection/components/TargetPowerState/TargetPowerStateDetailsItem';
import type { PlanSettingsVisibility } from '../../hooks/usePlanSettingsVisibility';

type PlanSettingsTargetSectionProps = {
  visibility: PlanSettingsVisibility;
};

const PlanSettingsTargetSection: FC<PlanSettingsTargetSectionProps> = ({ visibility }) => {
  const { canPatch, plan } = visibility;

  return (
    <>
      <TargetPowerStateDetailsItem canPatch={canPatch} plan={plan} />
      <TargetLabelsDetailsItem canPatch={canPatch} plan={plan} />
      <TargetNodeSelectorDetailsItem canPatch={canPatch} plan={plan} />
      <TargetAffinityDetailsItem canPatch={canPatch} plan={plan} />
    </>
  );
};

export default PlanSettingsTargetSection;
