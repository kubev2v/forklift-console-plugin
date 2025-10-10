import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { NetworkMapModelGroupVersionKind, type V1beta1NetworkMap } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { ConditionsSection } from '../../components/ConditionsSection/ConditionsSection';
import DetailsSection from '../../components/DetailsSection/DetailsSection';
import { MapsSection } from '../../components/MapsSection/MapsSection';
import { ProvidersSection } from '../../components/ProvidersSection/ProvidersSection';

type NetworkMapDetailsTabProps = {
  name: string;
  namespace: string;
};

export const NetworkMapDetailsTab: FC<NetworkMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <LoadingSuspend obj={obj} loaded={loaded} loadError={loadError}>
      <PageSection hasBodyWrapper={false} className="forklift-page-section--details">
        <SectionHeading text={t('Network map details')} />
        <DetailsSection obj={obj} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeading text={t('Providers')} />
        <ProvidersSection obj={obj} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeading text={t('Map')} />
        <MapsSection obj={obj} />
      </PageSection>

      <PageSection hasBodyWrapper={false} className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={obj?.status?.conditions ?? []} />
      </PageSection>
    </LoadingSuspend>
  );
};
