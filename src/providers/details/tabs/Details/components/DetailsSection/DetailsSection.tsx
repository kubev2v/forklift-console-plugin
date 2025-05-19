import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { useForkliftTranslation } from '@utils/i18n';

import type { DetailsSectionProps } from './utils/types';
import OpenshiftDetailsSection from './OpenshiftDetailsSection';
import OpenstackDetailsSection from './OpenstackDetailsSection';
import OVADetailsSection from './OVADetailsSection';
import OvirtDetailsSection from './OvirtDetailsSection';
import VSphereDetailsSection from './VSphereDetailsSection';

const DetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { permissions, provider } = data;

  if (!provider || !permissions)
    return <span className="text-muted">{t('No provider data available.')}</span>;

  switch (provider?.spec?.type) {
    case PROVIDER_TYPES.ovirt:
      return <OvirtDetailsSection data={data} />;
    case PROVIDER_TYPES.openshift:
      return <OpenshiftDetailsSection data={data} />;
    case PROVIDER_TYPES.openstack:
      return <OpenstackDetailsSection data={data} />;
    case PROVIDER_TYPES.vsphere:
      return <VSphereDetailsSection data={data} />;
    case PROVIDER_TYPES.ova:
      return <OVADetailsSection data={data} />;
    case undefined:
    default:
      return <></>;
  }
};

export default DetailsSection;
