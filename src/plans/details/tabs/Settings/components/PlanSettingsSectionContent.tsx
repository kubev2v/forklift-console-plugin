import type { FC, ReactNode } from 'react';

import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import type { PlanSettingsVisibility } from '../hooks/usePlanSettingsVisibility';
import {
  PLAN_SETTINGS_SECTION_ID,
  type PlanSettingsSectionId,
} from '../utils/planSettingsSectionIds';

import PlanSettingsConvertorSection from './sections/PlanSettingsConvertorSection';
import PlanSettingsGuestSection from './sections/PlanSettingsGuestSection';
import PlanSettingsNamingSection from './sections/PlanSettingsNamingSection';
import PlanSettingsTargetSection from './sections/PlanSettingsTargetSection';
import PlanSettingsTransferSection from './sections/PlanSettingsTransferSection';
import PlanSettingsSectionIntro from './PlanSettingsSectionIntro';

type PlanSettingsSectionContentProps = {
  sectionId: PlanSettingsSectionId;
  visibility: PlanSettingsVisibility;
};

const PlanSettingsSectionContent: FC<PlanSettingsSectionContentProps> = ({
  sectionId,
  visibility,
}) => {
  const getSectionContent = (): ReactNode => {
    switch (sectionId) {
      case PLAN_SETTINGS_SECTION_ID.Guest:
        return <PlanSettingsGuestSection visibility={visibility} />;
      case PLAN_SETTINGS_SECTION_ID.Transfer:
        return <PlanSettingsTransferSection visibility={visibility} />;
      case PLAN_SETTINGS_SECTION_ID.Naming:
        return <PlanSettingsNamingSection visibility={visibility} />;
      case PLAN_SETTINGS_SECTION_ID.Target:
        return <PlanSettingsTargetSection visibility={visibility} />;
      case PLAN_SETTINGS_SECTION_ID.Convertor:
        return <PlanSettingsConvertorSection visibility={visibility} />;
      default:
        return null;
    }
  };

  const sectionContent = getSectionContent();

  if (sectionContent === null) {
    return null;
  }

  return (
    <Stack data-testid={`plan-settings-section-${sectionId}`}>
      <StackItem>
        <PlanSettingsSectionIntro sectionId={sectionId} />
      </StackItem>
      <StackItem>
        <DescriptionList
          columnModifier={{
            default: '1Col',
            md: '2Col',
          }}
        >
          {sectionContent}
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};

export default PlanSettingsSectionContent;
