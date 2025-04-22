import type { FC } from 'react';

import type { Modify, V1beta1Provider } from '@kubev2v/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/core-api';

import type { EditModalProps } from '../EditModal/types';

import { OpenshiftEditURLModal } from './OpenshiftEditURLModal';
import { OpenstackEditURLModal } from './OpenstackEditURLModal';
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
    insecureSkipVerify?: string;
  }
>;

export const EditProviderURLModal: FC<EditProviderURLModalProps> = (props) => {
  switch (props.resource?.spec?.type) {
    case 'ovirt':
      return <OvirtEditURLModal {...props} />;
    case 'openshift':
      return <OpenshiftEditURLModal {...props} />;
    case 'openstack':
      return <OpenstackEditURLModal {...props} />;
    case 'vsphere':
      return <VSphereEditURLModal {...props} />;
    default:
      return <></>;
  }
};
