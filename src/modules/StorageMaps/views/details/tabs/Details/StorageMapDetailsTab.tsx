import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import MapsSection from 'src/storageMaps/details/MapsSection';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { StorageMapModelGroupVersionKind, type V1beta1StorageMap } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, PageSection } from '@patternfly/react-core';

import { ConditionsSection } from '../../components/ConditionsSection/ConditionsSection';
import DetailsSection from '../../components/DetailsSection/DetailsSection';
import { ProvidersSection } from '../../components/ProvidersSection/ProvidersSection';

type StorageMapDetailsTabProps = {
  name: string;
  namespace: string;
};

export const StorageMapDetailsTab: FC<StorageMapDetailsTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1StorageMap>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <LoadingSuspend obj={obj} loaded={loaded} loadError={loadError}>
      <PageSection variant="light" className="forklift-page-section--details">
        <SectionHeading text={t('Storage map details')} />
        <DetailsSection obj={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Providers')} />
        <ProvidersSection obj={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <SectionHeading text={t('Map')} />
          <MapsSection storageMap={obj} />
        </Flex>
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={obj?.status?.conditions ?? []} />
      </PageSection>
    </LoadingSuspend>
  );
};
