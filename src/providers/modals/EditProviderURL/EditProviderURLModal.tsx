import type { Modify, V1beta1Provider } from '@forklift-ui/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/core-api';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';

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

export const EditProviderURLModal: ModalComponent<EditProviderURLModalProps> = (props) => {
  switch (props.resource?.spec?.type) {
    case 'ovirt':
      return <OvirtEditURLModal {...props} />;
    case 'openshift':
      return <OpenshiftEditURLModal {...props} />;
    case 'openstack':
      return <OpenstackEditURLModal {...props} />;
    case 'vsphere':
      return <VSphereEditURLModal {...props} />;
    case undefined:
    default:
      return <></>;
  }
};
