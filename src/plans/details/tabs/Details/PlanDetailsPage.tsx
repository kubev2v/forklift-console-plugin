import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Divider, PageSection, PageSectionVariants } from '@patternfly/react-core';

import type { PlanPageProps } from '../../utils/types';

import DetailsSection from './components/DetailsSection/DetailsSection';
import SettingsSection from './components/SettingsSection/SettingsSection';

const PlanDetailsPage: FC<PlanPageProps> = ({ obj: plan }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Plan details')} />
        <DetailsSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Settings')} />
        <SettingsSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Providers')} />
        {/* <ProvidersSection obj={plan} /> */}
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Migrations')} />
        {/* <MigrationsSection obj={plan} /> */}
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <SectionHeading text={t('Conditions')} />
        {/* <ConditionsSection conditions={plan?.status?.conditions} /> */}
      </PageSection>
    </>
  );
};

export default PlanDetailsPage;
