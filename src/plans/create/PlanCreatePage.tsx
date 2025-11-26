import type { FC } from 'react';
import ForkliftWrapper from 'src/forkliftWrapper/ForkliftWrapper';

import { PageSection, PageSectionTypes, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreatePlanWizard from './CreatePlanWizard';

const PlanCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ForkliftWrapper>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h2">{t('Create migration plan')}</Title>
      </PageSection>

      <PageSection hasBodyWrapper={false} hasOverflowScroll type={PageSectionTypes.wizard}>
        <CreatePlanWizard />
      </PageSection>
    </ForkliftWrapper>
  );
};

export default PlanCreatePage;
