import { OpenShiftNamespace } from '@kubev2v/types';

import { NAMESPACE_FORKLIFT, NAMESPACE_MIGRATION } from '../utils';

import {
  OPENSHIFT_01_UID,
  OPENSHIFT_02_UID,
  OPENSHIFT_03_UID,
  OPENSHIFT_HOST_UID,
  OpenshiftProviderIDs,
} from './providers.mock';

export const MOCK_OPENSHIFT_NAMESPACES: { [uid in OpenshiftProviderIDs]: OpenShiftNamespace[] } = {
  [OPENSHIFT_HOST_UID]: [
    {
      uid: '11a0375f-f33e-489b-812a-d9a0929388ae',
      version: '12515',
      namespace: '',
      name: NAMESPACE_MIGRATION,
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/namespaces/11a0375f-f33e-489b-812a-d9a0929388ae`,
      object: { kind: 'Namespace', apiVersion: 'v1' },
    },
    {
      uid: '68d88b58-22f4-49ba-8665-74f4256aa617',
      version: '12558',
      namespace: '',
      name: NAMESPACE_FORKLIFT,
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/namespaces/68d88b58-22f4-49ba-8665-74f4256aa617`,
      object: { kind: 'Namespace', apiVersion: 'v1' },
    },
  ],
  [OPENSHIFT_01_UID]: [
    {
      uid: '338c69a1-bee1-40a9-af33-e83b0ec3cb99',
      version: '191',
      namespace: '',
      name: 'example-namespace-1',
      selfLink: `providers/openshift/${OPENSHIFT_01_UID}/namespaces/338c69a1-bee1-40a9-af33-e83b0ec3cb99`,
      object: { kind: 'Namespace', apiVersion: 'v1' },
    },
  ],
  [OPENSHIFT_02_UID]: [
    {
      uid: '287d34b7-763f-4065-ba3a-2b7d6440baf6',
      version: '814',
      namespace: '',
      name: 'example-namespace-2',
      selfLink: `providers/openshift/${OPENSHIFT_02_UID}/namespaces/287d34b7-763f-4065-ba3a-2b7d6440baf6`,
      object: { kind: 'Namespace', apiVersion: 'v1' },
    },
  ],
  [OPENSHIFT_03_UID]: [
    {
      uid: 'c4f375bb-39dc-4276-913e-0d4c43691d2f',
      version: '51',
      namespace: '',
      name: 'example-namespace-3',
      selfLink: `providers/openshift/${OPENSHIFT_03_UID}/namespaces/c4f375bb-39dc-4276-913e-0d4c43691d2f`,
      object: { kind: 'Namespace', apiVersion: 'v1' },
    },
  ],
};
