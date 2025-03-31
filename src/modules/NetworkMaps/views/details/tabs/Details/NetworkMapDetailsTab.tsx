import React from 'react';
import { SectionHeading } from 'src/components/headers/SectionHeading';
import { Suspend } from 'src/modules/Plans/views/details/components';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelGroupVersionKind, type V1beta1NetworkMap } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { ConditionsSection, DetailsSection, MapsSection, ProvidersSection } from '../../components';

type NetworkMapDetailsTabProps = {
  name: string;
  namespace: string;
};

export const NetworkMapDetailsTab: React.FC<NetworkMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <Suspend obj={obj} loaded={loaded} loadError={loadError}>
      <PageSection variant="light" className="forklift-page-section--details">
        <SectionHeading text={t('NetworkMap details')} />
        <DetailsSection obj={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Providers')} />
        <ProvidersSection obj={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Map')} />
        <MapsSection obj={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={obj?.status?.conditions} />
      </PageSection>
    </Suspend>
  );
};
