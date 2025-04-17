import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import SectionHeading from 'src/components/headers/SectionHeading';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import Loading from '@components/Loading';
import {
  type ProviderInventory,
  ProviderModel,
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Bullseye, PageSection } from '@patternfly/react-core';
import BellIcon from '@patternfly/react-icons/dist/esm/icons/bell-icon';

import { ConditionsSection } from '../../components/ConditionsSection/ConditionsSection';
import { DetailsSection } from '../../components/DetailsSection/DetailsSection';
import { InventorySection } from '../../components/InventorySection/InventorySection';
import { SecretsSection } from '../../components/SecretsSection/SecretsSection';

type ProviderDetailsProps = {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ProviderDetails: FC<ProviderDetailsProps> = ({ loaded, loadError, obj }) => {
  const { t } = useForkliftTranslation();
  const { inventory, provider } = obj;

  if (!loaded || loadError || !provider?.metadata?.name) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  const providerURL = getResourceUrl({
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
    reference: ProviderModelRef,
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

export const ProviderDetailsWrapper: FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });

  const data = { inventory, permissions, provider };

  return <ProviderDetails obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
};
