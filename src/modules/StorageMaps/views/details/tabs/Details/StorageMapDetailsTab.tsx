import React from 'react';
import { SectionHeading } from 'src/components/headers/SectionHeading';
import { Suspend } from 'src/modules/Plans/views/details/components';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelGroupVersionKind, type V1beta1StorageMap } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { ConditionsSection, DetailsSection, MapsSection, ProvidersSection } from '../../components';

type StorageMapDetailsTabProps = {
  name: string;
  namespace: string;
};

export const StorageMapDetailsTab: React.FC<StorageMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1StorageMap>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <Suspend obj={obj} loaded={loaded} loadError={loadError}>
      <PageSection variant="light" className="forklift-page-section--details">
        <SectionHeading text={t('StorageMap details')} />
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
