import type { FC } from 'react';
import { ErrorState } from 'src/components/common/Page/PageStates';
import ForkliftWrapper from 'src/forkliftWrapper/ForkliftWrapper';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { type K8sModel, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { PROVIDER_TYPES } from '../utils/constants';

import OpenshiftProviderDetailsPage from './OpenshiftProviderDetailsPage';
import OpenStackProviderDetailsPage from './OpenStackProviderDetailsPage';
import OvaProviderDetailsPage from './OvaProviderDetailsPage';
import OVirtProviderDetailsPage from './OVirtProviderDetailsPage';
import VSphereProviderDetailsPage from './VSphereProviderDetailsPage';

import './ProviderDetailsPage.style.scss';

type ProviderDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  name: string;
  namespace: string;
};

const ProviderDetailsPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [provider, loaded, error] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const renderPage = () => {
    if (error) {
      return <ErrorState title={t('Unable to retrieve data.')} />;
    }

    if (!loaded) {
      return <LoadingSuspend />;
    }

    switch (provider?.spec?.type) {
      case PROVIDER_TYPES.openshift:
        return <OpenshiftProviderDetailsPage name={name} namespace={namespace} />;
      case PROVIDER_TYPES.openstack:
        return <OpenStackProviderDetailsPage name={name} namespace={namespace} />;
      case PROVIDER_TYPES.ovirt:
        return <OVirtProviderDetailsPage name={name} namespace={namespace} />;
      case PROVIDER_TYPES.vsphere:
        return <VSphereProviderDetailsPage name={name} namespace={namespace} />;
      case PROVIDER_TYPES.ova:
        return <OvaProviderDetailsPage name={name} namespace={namespace} />;
      case undefined:
      default:
        return <ErrorState title={t('Unsupported provider type')} />;
    }
  };
  return <ForkliftWrapper>{renderPage()}</ForkliftWrapper>;
};

export default ProviderDetailsPage;
