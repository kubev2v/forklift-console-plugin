import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getPlanSettingsSectionDescription } from '../utils/planSettingsSectionDescriptions';
import type { PlanSettingsSectionId } from '../utils/planSettingsSectionIds';
import { getPlanSettingsSectionLabel } from '../utils/planSettingsSectionLabels';

type PlanSettingsSectionIntroProps = {
  sectionId: PlanSettingsSectionId;
};

const PlanSettingsSectionIntro: FC<PlanSettingsSectionIntroProps> = ({ sectionId }) => {
  const { t } = useForkliftTranslation();

  return (
    <div className="forklift-plan-settings__section-intro">
      <SectionHeading
        headingLevel="h2"
        testId={`plan-settings-section-${sectionId}-title`}
        text={getPlanSettingsSectionLabel(sectionId, t)}
      />
      <Content
        className="text-muted forklift-plan-settings__section-description"
        component={ContentVariants.p}
        data-testid={`plan-settings-section-${sectionId}-description`}
      >
        {getPlanSettingsSectionDescription(sectionId, t)}
      </Content>
    </div>
  );
};

export default PlanSettingsSectionIntro;
