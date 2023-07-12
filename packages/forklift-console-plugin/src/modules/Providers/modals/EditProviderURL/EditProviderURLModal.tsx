import React from 'react';

import { Modify, V1beta1Provider } from '@kubev2v/types';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/core-api';

import { EditModalProps } from '../EditModal';

import { OpenshiftEditURLModal } from './OpenshiftEditURLModal';
import { OpenstackEditURLModal } from './OpenstackEditURLModal';
import { OVAEditURLModal } from './OVAEditURLModal';
import { OvirtEditURLModal } from './OvirtEditURLModal';
import { VSphereEditURLModal } from './VSphereEditURLModal';

export type EditProviderURLModalProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Provider;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

export const EditProviderURLModal: React.FC<EditProviderURLModalProps> = (props) => {
  switch (props.resource?.spec?.type) {
    case 'ovirt':
      return <OvirtEditURLModal {...props} />;
    case 'openshift':
      return <OpenshiftEditURLModal {...props} />;
    case 'openstack':
      return <OpenstackEditURLModal {...props} />;
    case 'vsphere':
      return <VSphereEditURLModal {...props} />;
    case 'ova':
      return <OVAEditURLModal {...props} />;
    default:
      return <></>;
  }
};
