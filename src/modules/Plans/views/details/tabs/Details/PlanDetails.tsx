import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import Suspend from '@components/Suspend';
import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { ConditionsSection } from '../../components/ConditionsSection/ConditionsSection';
import { DetailsSection } from '../../components/DetailsSection/DetailsSection';
import { MigrationsSection } from '../../components/MigrationsSection/MigrationsSection';
import { ProvidersSection } from '../../components/ProvidersSection/ProvidersSection';
import { SettingsSection } from '../../components/SettingsSection/SettingsSection';

export const PlanDetails: FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  return (
    <Suspend obj={plan} loaded={loaded} loadError={loadError}>
      <PageSection variant="light" className="forklift-page-section--details">
        <SectionHeading text={t('Plan details')} />
        <DetailsSection obj={plan} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Settings')} />
        <SettingsSection obj={plan} permissions={permissions} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Providers')} />
        <ProvidersSection obj={plan} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Migrations')} />
        <MigrationsSection obj={plan} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={plan?.status?.conditions} />
      </PageSection>
    </Suspend>
  );
};
