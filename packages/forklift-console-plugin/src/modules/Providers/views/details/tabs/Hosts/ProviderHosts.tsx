import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ModalHOC } from 'src/modules/Providers/modals';
import { ProviderData } from 'src/modules/Providers/utils';

import { VSphereHostsList } from './VSphereHostsList';

export interface ProviderHostsProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

const ProviderHosts_: React.FC<ProviderHostsProps> = (props) => {
  const { provider } = props.obj;

  switch (provider?.spec?.type) {
    case 'vsphere':
      return <VSphereHostsList {...props} />;
    default:
      return <></>;
  }
};

export const ProviderHosts: React.FC<ProviderHostsProps> = (props) => (
  <ModalHOC>
    <ProviderHosts_ {...props} />
  </ModalHOC>
);
