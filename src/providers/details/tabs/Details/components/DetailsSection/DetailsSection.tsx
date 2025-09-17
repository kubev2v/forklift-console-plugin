import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import SectionHeading from '@components/headers/SectionHeading';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';
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

  const getDetailsSectionByType = (
    type: string | undefined,
  ): FC<DetailsSectionProps> | undefined => {
    switch (type) {
      case PROVIDER_TYPES.ovirt:
        return OvirtDetailsSection;
      case PROVIDER_TYPES.openshift:
        return OpenshiftDetailsSection;
      case PROVIDER_TYPES.openstack:
        return OpenstackDetailsSection;
      case PROVIDER_TYPES.vsphere:
        return VSphereDetailsSection;
      case PROVIDER_TYPES.ova:
        return OVADetailsSection;
      case undefined:
      default:
        return undefined;
    }
  };

  if (!provider || !permissions)
    return <span className="text-muted">{t('No provider data available.')}</span>;

  const DetailsSectionByType = getDetailsSectionByType(provider?.spec?.type);

  return (
    DetailsSectionByType && (
      <PageSection variant={PageSectionVariants.light} className="forklift-page-section--details">
        <SectionHeading text={t('Provider details')} />
        {DetailsSectionByType && <DetailsSectionByType data={data} />}
      </PageSection>
    )
  );
};

export default DetailsSection;
