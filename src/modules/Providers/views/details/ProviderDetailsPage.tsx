import { type FC, memo } from 'react';
import { LoadingDots } from 'src/components/common/LoadingDots/LoadingDots';
import { ErrorState } from 'src/components/common/Page/PageStates';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { type K8sModel, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { OpenshiftProviderDetailsPage } from './OpenshiftProviderDetailsPage';
import { OpenStackProviderDetailsPage } from './OpenStackProviderDetailsPage';
import { OvaProviderDetailsPage } from './OvaProviderDetailsPage';
import { OVirtProviderDetailsPage } from './OVirtProviderDetailsPage';
import { VSphereProviderDetailsPage } from './VSphereProviderDetailsPage';

import './ProviderDetailsPage.style.css';

const ProviderDetailsPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const [provider, loaded, error] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });
  return (
    <ProviderDetailsPage_
      name={name}
      namespace={namespace}
      type={provider?.spec?.type}
      loaded={loaded}
      error={error}
    />
  );
};
ProviderDetailsPage.displayName = 'ProviderDetails';

const ProviderDetailsPageInternal: FC<{
  name: string;
  namespace: string;
  type: string;
  loaded: boolean;
  error: unknown;
}> = ({ error, loaded, name, namespace, type }) => {
  const { t } = useForkliftTranslation();
  // status checked in the order used in the Console's StatusBox component
  if (error) {
    return <LoadError error={error} />;
  }

  if (!loaded) {
    return <LoadingDots />;
  }

  switch (type) {
    case 'openshift':
      return <OpenshiftProviderDetailsPage name={name} namespace={namespace} />;
    case 'openstack':
      return <OpenStackProviderDetailsPage name={name} namespace={namespace} />;
    case 'ovirt':
      return <OVirtProviderDetailsPage name={name} namespace={namespace} />;
    case 'vsphere':
      return <VSphereProviderDetailsPage name={name} namespace={namespace} />;
    case 'ova':
      return <OvaProviderDetailsPage name={name} namespace={namespace} />;
    default:
      return <ErrorState title={t('Unsupported provider type')} />;
  }
};

const ProviderDetailsPage_ = memo(ProviderDetailsPageInternal);

// API provides no typing info for the error prop
const LoadError = ({ error }: { error: any }) => {
  const { t } = useForkliftTranslation();
  const status = error?.response?.status;

  if (status === 404) {
    return <ErrorState title={t('404: Not Found')} />;
  }
  if (status === 403) {
    return <ErrorState title={t("You don't have access to this section due to cluster policy.")} />;
  }

  return <ErrorState title={t('Unable to retrieve data')} />;
};

type ProviderDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

export default ProviderDetailsPage;
