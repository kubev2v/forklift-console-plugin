import type { Modify, V1beta1Provider } from '@forklift-ui/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/core-api';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';

import type { EditModalProps } from '../EditModal/types';

import { OpenshiftEditUIModal } from './OpenshiftEditUIModal';
import { OpenstackEditUIModal } from './OpenstackEditUIModal';
import { OvirtEditUIModal } from './OvirtEditUIModal';
import { VSphereEditUIModal } from './VSphereEditUIModal';

export type EditProviderUIModalProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Provider;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
    content?: string;
  }
>;

export const EditProviderUIModal: ModalComponent<EditProviderUIModalProps> = (props) => {
  switch (props.resource?.spec?.type) {
    case 'vsphere':
      return <VSphereEditUIModal {...props} />;
    case 'ovirt':
      return <OvirtEditUIModal {...props} />;
    case 'openshift':
      return <OpenshiftEditUIModal {...props} />;
    case 'openstack':
      return <OpenstackEditUIModal {...props} />;
    case undefined:
    default:
      return <></>;
  }
};
