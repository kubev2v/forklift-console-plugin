import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { SectionHeading } from 'src/components/headers/SectionHeading';
import { Loading } from 'src/modules/Plans/views/details';
import { useGetDeleteAndEditAccessReview, useProviderInventory } from 'src/modules/Providers/hooks';
import { getResourceUrl, ProviderData } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  ProviderInventory,
  ProviderModel,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Bullseye, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import {
  ConditionsSection,
  DetailsSection,
  InventorySection,
  SecretsSection,
} from '../../components';

interface ProviderDetailsProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderDetails: React.FC<ProviderDetailsProps> = ({ obj, loaded, loadError }) => {
  const { t } = useForkliftTranslation();
  const { provider, inventory } = obj;

  if (!loaded || loadError || !provider?.metadata?.name) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  const providerURL = getResourceUrl({
    reference: ProviderModelRef,
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
  });

  return (
    <div>
      <PageSection variant="light" className="forklift-page-section--info">
        {inventory?.vmCount > 0 && (
          <Alert
            customIcon={<BellIcon />}
            variant="info"
            title={t('How to create a migration plan')}
          >
            <ForkliftTrans>
              To migrate virtual machines from <strong>{provider.metadata.name}</strong> provider,
              select the virtual machines to migrate from the list of available virtual machines
              located in the virtual machines tab.{' '}
              <Link to={`${providerURL}/vms`}>
                Go to <strong>Virtual Machines</strong> tab
              </Link>
            </ForkliftTrans>
          </Alert>
        )}
      </PageSection>

      <PageSection variant="light" className="forklift-page-section--details">
        <SectionHeading text={t('Provider details')} />
        <DetailsSection data={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Secrets')} />
        <SecretsSection data={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Provider inventory')} />
        <InventorySection data={obj} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={provider?.status?.conditions} />
      </PageSection>
    </div>
  );
};

export const ProviderDetailsWrapper: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });

  const data = { provider, inventory, permissions };

  return <ProviderDetails obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
};
