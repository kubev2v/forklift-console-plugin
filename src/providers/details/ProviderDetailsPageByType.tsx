import type { FC } from 'react';
import { ErrorState } from 'src/components/common/Page/PageStates';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PROVIDER_TYPES } from '../utils/constants';

import OpenshiftProviderDetailsPage from './OpenshiftProviderDetailsPage';
import OpenStackProviderDetailsPage from './OpenStackProviderDetailsPage';
import OvaProviderDetailsPage from './OvaProviderDetailsPage';
import OVirtProviderDetailsPage from './OVirtProviderDetailsPage';
import VSphereProviderDetailsPage from './VSphereProviderDetailsPage';

import './ProviderDetailsPage.style.scss';

type ProviderDetailsPageByTypeProps = {
  type?: string;
  name: string;
  namespace: string;
};

const ProviderDetailsPageByType: FC<ProviderDetailsPageByTypeProps> = ({
  name,
  namespace,
  type,
}) => {
  const { t } = useForkliftTranslation();

  switch (type) {
    case PROVIDER_TYPES.openshift:
      return <OpenshiftProviderDetailsPage name={name} namespace={namespace} />;
    case PROVIDER_TYPES.openstack:
      return <OpenStackProviderDetailsPage name={name} namespace={namespace} />;
    case PROVIDER_TYPES.ovirt:
      return <OVirtProviderDetailsPage name={name} namespace={namespace} />;
    case PROVIDER_TYPES.vsphere:
      return <VSphereProviderDetailsPage name={name} namespace={namespace} />;
    case PROVIDER_TYPES.ova:
    case PROVIDER_TYPES.hyperv:
      return <OvaProviderDetailsPage name={name} namespace={namespace} />;
    case undefined:
    default:
      return <ErrorState title={t('Unsupported provider type')} />;
  }
};

export default ProviderDetailsPageByType;
