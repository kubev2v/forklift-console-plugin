import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RouteComponentProps } from 'react-router-dom';
import { SectionHeading } from 'src/components/headers/SectionHeading';
import { useGetDeleteAndEditAccessReview, useProviderInventory } from 'src/modules/Providers/hooks';
import { getResourceUrl, ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  ProviderInventory,
  ProviderModel,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import {
  ConditionsSection,
  DetailsSection,
  InventorySection,
  SecretsSection,
} from '../../components';

interface ProviderDetailsProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderDetails: React.FC<ProviderDetailsProps> = ({ obj, loaded, loadError }) => {
  const { t } = useForkliftTranslation();
  const { provider } = obj;

  if (!loaded || loadError || !provider?.metadata?.name) {
    return <></>;
  }

  const providerURL = getResourceUrl({
    reference: ProviderModelRef,
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
  });

  return (
    <div>
      <PageSection variant="light" className="forklift-page-section--info">
        <Alert
          customIcon={<BellIcon />}
          variant="warning"
          title={t('How to create a migration plan')}
        >
          <Trans t={t} ns="plugin__forklift-console-plugin">
            To migrate virtual machines from <strong>{provider.metadata.name}</strong> provider,
            select the virtual machines to migrate from the list of available virtual machines
            located in the virtual machines tab.{' '}
            <Link to={`${providerURL}/vms`}>
              Go to <strong>Virtual Machines</strong> tab
            </Link>
          </Trans>
        </Alert>
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
