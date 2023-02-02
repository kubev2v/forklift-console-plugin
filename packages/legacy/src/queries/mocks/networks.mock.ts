import { ISourceNetwork, IOpenShiftNetwork } from '../types';

export let MOCK_VMWARE_NETWORKS: ISourceNetwork[] = [];
export let MOCK_RHV_NETWORKS: ISourceNetwork[] = [];
export let MOCK_OPENSHIFT_NETWORKS: IOpenShiftNetwork[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_VMWARE_NETWORKS = [
    {
      id: '1',
      name: 'vmware-network-1',
      selfLink: '/foo/vmwarenetwork/1',
      path: '/V2V-DC/network/vDS-00',
    },
    {
      id: '2',
      name: 'vmware-network-2',
      selfLink: '/foo/vmwarenetwork/2',
      path: '/V2V-DC/network/vDS-00',
    },
    {
      id: '3',
      name: 'vmware-network-3',
      selfLink: '/foo/vmwarenetwork/3',
      path: '/V2V-DC/network/vDS-00',
    },
    {
      id: '4',
      name: 'vmware-network-4',
      selfLink: '/foo/vmwarenetwork/4',
      path: '/V2V-DC/network/vDS-00',
    },
    {
      id: '5',
      name: 'vmware-network-5',
      selfLink: '/foo/vmwarenetwork/5',
      path: '/V2V-DC/network/vDS-00',
    },
  ];

  MOCK_RHV_NETWORKS = [
    {
      id: '1',
      name: 'rhv-network-1',
      selfLink: '/foo/rhvnetwork/1',
      path: 'Default/VM_Isolated_00',
    },
    {
      id: '2',
      name: 'rhv-network-2',
      selfLink: '/foo/rhvnetwork/2',
      path: 'Primary/VM_Isolated_00',
    },
    {
      id: '3',
      name: 'rhv-network-3',
      selfLink: '/foo/rhvnetwork/3',
      path: 'Default/VM_Isolated_00',
    },
    {
      id: '4',
      name: 'rhv-network-4',
      selfLink: '/foo/rhvnetwork/4',
      path: 'Default/VM_Isolated_00',
    },
    {
      id: '5',
      name: 'rhv-network-5',
      selfLink: '/foo/rhvnetwork/5',
      path: 'Default/VM_Isolated_00',
    },
  ];

  MOCK_OPENSHIFT_NETWORKS = [
    {
      uid: 'foo-network-uid-1',
      namespace: 'openshift-migration',
      name: 'ocp-network-1',
      selfLink: '/foo/openshiftnetwork/1',
    },
    {
      uid: 'foo-network-uid-2',
      namespace: 'openshift-migration',
      name: 'ocp-network-2',
      selfLink: '/foo/openshiftnetwork/2',
    },
    {
      uid: 'foo-network-uid-3',
      namespace: 'openshift-migration',
      name: 'ocp-network-3',
      selfLink: '/foo/openshiftnetwork/3',
    },
    {
      uid: 'foo-network-uid-4',
      namespace: 'openshift-migration',
      name: 'ocp-network-4',
      selfLink: '/foo/openshiftnetwork/4',
    },
    {
      uid: 'foo-network-uid-5',
      namespace: 'openshift-migration',
      name: 'ocp-network-5',
      selfLink: '/foo/openshiftnetwork/5',
    },
    {
      uid: 'foo-network-uid-6',
      namespace: 'example-project',
      name: 'ocp-network-1',
      selfLink: '/bar/openshiftnetwork/5',
    },
  ];
}
