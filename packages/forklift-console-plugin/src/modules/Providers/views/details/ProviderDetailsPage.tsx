import React, { memo } from 'react';

import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { useProviderType } from '../../hooks';

import { OpenshiftProviderDetailsPage } from './OpenshiftProviderDetailsPage';
import { OpenStackProviderDetailsPage } from './OpenStackProviderDetailsPage';
import { OvaProviderDetailsPage } from './OvaProviderDetailsPage';
import { OVirtProviderDetailsPage } from './OVirtProviderDetailsPage';
import { VSphereProviderDetailsPage } from './VSphereProviderDetailsPage';

import './ProviderDetailsPage.style.css';

export const ProviderDetailsPage: React.FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const type = useProviderType(name, namespace);
  return <ProviderDetailsPage_ name={name} namespace={namespace} type={type} />;
};

export const ProviderDetailsPage_: React.FC<{ name: string; namespace: string; type: string }> =
  // eslint-disable-next-line react/display-name, react/prop-types
  memo(({ name, namespace, type }) => {
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
        return <></>;
    }
  });
ProviderDetailsPage.displayName = 'ProviderDetails';

type ProviderDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

export default ProviderDetailsPage;
