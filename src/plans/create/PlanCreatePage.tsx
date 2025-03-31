import React, { type FC } from 'react';

import { PageSection, PageSectionTypes, PageSectionVariants, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { CreatePlanWizard } from './CreatePlanWizard';

export const PlanCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h2">{t('Create migration plan')}</Title>
      </PageSection>

      <PageSection
        hasOverflowScroll
        variant={PageSectionVariants.light}
        type={PageSectionTypes.wizard}
      >
        <CreatePlanWizard />
      </PageSection>
    </>
  );
};

export default PlanCreatePage;
