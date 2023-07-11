import React from 'react';
import { ModalHOC } from 'src/modules/ProvidersNG/modals';
import { ProviderData } from 'src/modules/ProvidersNG/utils';

import { OpenshiftDetailsSection } from './OpenshiftDetailsSection';
import { OpenstackDetailsSection } from './OpenstackDetailsSection';
import { OvirtDetailsSection } from './OvirtDetailsSection';
import { VSphereDetailsSection } from './VSphereDetailsSection';

const DetailsSection_: React.FC<DetailsSectionProps> = (props) => {
  const { provider } = props.data;

  switch (provider?.spec?.type) {
    case 'ovirt':
      return <OvirtDetailsSection {...props} />;
    case 'openshift':
      return <OpenshiftDetailsSection {...props} />;
    case 'openstack':
      return <OpenstackDetailsSection {...props} />;
    case 'vsphere':
      return <VSphereDetailsSection {...props} />;
    default:
      return <></>;
  }
};

export const DetailsSection: React.FC<DetailsSectionProps> = (props) => (
  <ModalHOC>
    <DetailsSection_ {...props} />
  </ModalHOC>
);

export type DetailsSectionProps = {
  data: ProviderData;
};
