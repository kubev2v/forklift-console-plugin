import type { FC } from 'react';

import ConvertorAffinityDetailsItem from '../../../Details/components/SettingsSection/components/ConvertorAffinity/ConvertorAffinityDetailsItem';
import ConvertorLabelsDetailsItem from '../../../Details/components/SettingsSection/components/ConvertorLabels/ConvertorLabelsDetailsItem';
import ConvertorNodeSelectorDetailsItem from '../../../Details/components/SettingsSection/components/ConvertorNodeSelector/ConvertorNodeSelectorDetailsItem';
import type { PlanSettingsVisibility } from '../../hooks/usePlanSettingsVisibility';

type PlanSettingsConvertorSectionProps = {
  visibility: PlanSettingsVisibility;
};

const PlanSettingsConvertorSection: FC<PlanSettingsConvertorSectionProps> = ({ visibility }) => {
  const { canPatch, isVsphere, plan } = visibility;

  return (
    <>
      <ConvertorLabelsDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <ConvertorNodeSelectorDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <ConvertorAffinityDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
    </>
  );
};

export default PlanSettingsConvertorSection;
