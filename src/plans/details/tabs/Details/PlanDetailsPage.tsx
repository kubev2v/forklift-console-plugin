import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import ExpandableSectionHeading from '@components/ExpandableSectionHeading/ExpandableSectionHeading';
import StatusIcon from '@components/status/StatusIcon';
import { Divider, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { CATEGORY_TYPES } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import type { PlanPageProps } from '../../utils/types';

import ConditionsSection from './components/ConditionsSection/ConditionsSection';
import DetailsSection from './components/DetailsSection/DetailsSection';
import MigrationsSection from './components/MigrationsSection/MigrationsSection';
import ProvidersSection from './components/ProvidersSection/ProvidersSection';
import SettingsSection from './components/SettingsSection/SettingsSection';

const PlanDetailsPage: FC<PlanPageProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  const criticalCondition = plan?.status?.conditions?.find(
    (condition) => condition?.category === CATEGORY_TYPES.CRITICAL,
  );

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Plan details')} />
        <DetailsSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Providers')} />
        <ProvidersSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Plan settings')} />
        <SettingsSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <ExpandableSectionHeading
          section={<MigrationsSection plan={plan} />}
          sectionTitle={t('Migration history')}
        />
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <ExpandableSectionHeading
          section={<ConditionsSection conditions={plan?.status?.conditions} />}
          sectionTitle={
            <>
              {t('Conditions')}{' '}
              {!isEmpty(criticalCondition) && (
                <StatusIcon phase={criticalCondition?.category ?? CATEGORY_TYPES.CRITICAL} />
              )}
            </>
          }
        />
      </PageSection>
    </>
  );
};

export default PlanDetailsPage;
