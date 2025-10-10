import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import ExpandableSectionHeading from '@components/ExpandableSectionHeading/ExpandableSectionHeading';
import StatusIcon from '@components/status/StatusIcon';
import { Divider, PageSection } from '@patternfly/react-core';
import { CATEGORY_TYPES } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import ConditionsSection from './components/ConditionsSection/ConditionsSection';
import DetailsSection from './components/DetailsSection/DetailsSection';
import MigrationsSection from './components/MigrationsSection/MigrationsSection';
import ProvidersSection from './components/ProvidersSection/ProvidersSection';
import SettingsSection from './components/SettingsSection/SettingsSection';

const PlanDetailsPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { plan } = usePlan(name, namespace);

  const criticalCondition = plan?.status?.conditions?.find(
    (condition) => condition?.category === CATEGORY_TYPES.CRITICAL,
  );

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <SectionHeading text={t('Plan details')} />
        <DetailsSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection hasBodyWrapper={false}>
        <SectionHeading text={t('Providers')} />
        <ProvidersSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection hasBodyWrapper={false}>
        <SectionHeading text={t('Plan settings')} />
        <SettingsSection plan={plan} />
      </PageSection>
      <Divider />
      <PageSection hasBodyWrapper={false}>
        <ExpandableSectionHeading
          section={<MigrationsSection plan={plan} />}
          sectionTitle={t('Migration history')}
          sectionHelpTip={t(
            `All past migration runs for this plan. This includes both successful and failed attempts, but detailed logs and other data are not available after the migration pods are deleted. If you retry an incomplete migration, only the failed VMs will migrate again.`,
          )}
        />
      </PageSection>
      <Divider />
      <PageSection hasBodyWrapper={false}>
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
