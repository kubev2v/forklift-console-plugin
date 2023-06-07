/* eslint-disable @cspell/spellchecker */
import { OpenstackTreeNode, OvirtTreeNode, VSphereTreeNode } from '@kubev2v/types';

import {
  OPENSTACK_01_UID,
  OPENSTACK_02_UID,
  OpenstackProviderIDs,
  OVIRT_01_UID,
  OVIRT_02_UID,
  OVIRT_03_UID,
  OVIRT_INSECURE_UID,
  OvirtProviderIDs,
  VMWARE_01_UID,
  VMWARE_02_UID,
  VMWARE_03_UID,
  VmwareProviderIDs,
} from './providers.mock';

export const MOCK_VMWARE_HOST_TREE: { [uid in VmwareProviderIDs]: VSphereTreeNode } = {
  [VMWARE_01_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-2760',
          name: 'Fake_DC',
          selfLink: `providers/vsphere/${VMWARE_01_UID}/datacenters/datacenter-2760`,
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-21',
          name: 'V2V-DC',
          selfLink: `providers/vsphere/${VMWARE_01_UID}/datacenters/datacenter-21`,
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'domain-c26',
              name: 'V2V_Cluster',
              selfLink: `providers/vsphere/${VMWARE_01_UID}/clusters/domain-c26`,
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'host-29',
                  name: 'esx13.v2v.example.com',
                  selfLink: `/providers/vsphere/${VMWARE_01_UID}/hosts/host-29`,
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1630',
                      name: 'test-migration',
                      selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-1630`,
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-template-test',
                      name: 'vm-template-test',
                      selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-template-test`,
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2844',
                      name: 'test-migration-2',
                      selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-2844`,
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1008',
                      name: 'test-migration-centos',
                      selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-1008`,
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2685',
                      name: 'pemcg-discovery01',
                      selfLink: `/providers/vsphere/${VMWARE_01_UID}/vms/vm-2685`,
                    },
                    children: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  [VMWARE_02_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-2761',
          name: 'Fake_DC',
          selfLink: `providers/vsphere/test4/${VMWARE_02_UID}/datacenter-2761`,
        },
        children: null,
      },
    ],
  },
  [VMWARE_03_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: '',
          name: 'Fake_DC',
          selfLink: `providers/vsphere/${VMWARE_03_UID}/datacenters/datacenter-2762`,
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-22',
          name: 'V2V-DC',
          selfLink: `providers/vsphere/${VMWARE_03_UID}/datacenters/datacenter-22`,
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'domain-c2758',
              name: 'Fake_Cluster',
              selfLink: `providers/vsphere/${VMWARE_03_UID}/clusters/domain-c2758`,
            },
            children: null,
          },
          {
            kind: 'Cluster',
            object: {
              id: 'domain-s8928',
              variant: 'ComputeResource',
              name: 'fake-host',
              selfLink: `providers/vsphere/${VMWARE_03_UID}/clusters/domain-s8928`,
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'host-8930',
                  name: 'fake-host',
                  selfLink: `providers/vsphere/${VMWARE_03_UID}/hosts/host-8930`,
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-431',
                      name: 'pemcg-iscsi-target',
                      selfLink: `providers/vsphere/${VMWARE_03_UID}/vms/vm-431`,
                    },
                    children: null,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const MOCK_RHV_HOST_TREE: { [uid in OvirtProviderIDs]: OvirtTreeNode } = {
  [OVIRT_01_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'DataCenter',
        object: {
          id: '30528e0a-23eb-11e8-805f-00163e18b6f7',
          revision: 1,
          path: 'Default',
          name: 'Default',
          selfLink: `providers/ovirt/${OVIRT_01_UID}/datacenters/30528e0a-23eb-11e8-805f-00163e18b6f7`,
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'a180e5df-a7c3-469c-9440-0d9095973f65',
              revision: 1,
              path: 'Default/rhel8-Local',
              name: 'rhel8-Local',
              selfLink: `providers/ovirt/${OVIRT_01_UID}/clusters/a180e5df-a7c3-469c-9440-0d9095973f65`,
            },
            children: null,
          },
          {
            kind: 'Cluster',
            object: {
              id: '3053b92e-23eb-11e8-959c-00163e18b6f7',
              revision: 1,
              path: 'Default/main',
              name: 'main',
              selfLink: `providers/ovirt/${OVIRT_01_UID}/clusters/3053b92e-23eb-11e8-959c-00163e18b6f7`,
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: '70281367-d681-406f-af91-a1e866f189c4',
                  revision: 1,
                  path: 'main/host-2.example.com',
                  name: 'host-2.example.com',
                  selfLink: `providers/ovirt/${OVIRT_01_UID}/hosts/70281367-d681-406f-af91-a1e866f189c4`,
                },
                children: null,
              },
              {
                kind: 'Host',
                object: {
                  id: 'c75a349c-a429-4afc-83cc-44fbd6447758',
                  revision: 1,
                  path: 'main/host.example.com',
                  name: 'host.example.com',
                  selfLink: `providers/ovirt/${OVIRT_01_UID}/hosts/c75a349c-a429-4afc-83cc-44fbd6447758`,
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: '3dcaf3ec-6b51-4ca0-8345-6d61841731d7',
                  revision: 1,
                  path: 'main/cfme-5.11.9.0-1',
                  name: 'cfme-5.11.9.0-1',
                  description: 'test VM',
                  selfLink: `providers/ovirt/${OVIRT_01_UID}/vms/3dcaf3ec-6b51-4ca0-8345-6d61841731d7`,
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: '2a66a719-440c-4544-9da0-692d14338b12',
                  revision: 1,
                  path: 'main/dev-rhel8',
                  name: 'dev-rhel8',
                  description: 'here is a test',
                  selfLink: `providers/ovirt/${OVIRT_01_UID}/vms/2a66a719-440c-4544-9da0-692d14338b12`,
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: '64333a40-ffbb-4c28-add7-5560bdf082fb',
                  revision: 1,
                  path: 'main/management-dev',
                  name: 'management-dev',
                  description: 'interesting info',
                  selfLink: `providers/ovirt/${OVIRT_01_UID}/vms/64333a40-ffbb-4c28-add7-5560bdf082fb`,
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: '6f9de857-ef39-43b7-8853-af982286dc59',
                  revision: 1,
                  path: 'main/isolated-vm',
                  name: 'isolated-vm',
                  selfLink: `providers/ovirt/${OVIRT_01_UID}/vms/6f9de857-ef39-43b7-8853-af982286dc59`,
                },
                children: null,
              },
            ],
          },
        ],
      },
    ],
  },
  [OVIRT_02_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'DataCenter',
        object: {
          id: 'f7f5a24c-b030-4961-812b-4deb9658565b',
          name: 'Default',
          path: 'Default',
          revision: 1,
          selfLink: `providers/ovirt/${OVIRT_02_UID}/datacenters/f7f5a24c-b030-4961-812b-4deb9658565b`,
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'f0e11db9-579f-478c-af2e-05a268baf179',
              revision: 1,
              path: 'Default/clusterOne',
              name: 'clusterOne',
              selfLink: `providers/ovirt/${OVIRT_01_UID}/clusters/f0e11db9-579f-478c-af2e-05a268baf179`,
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: '6f9de857-ef39-43b7-8853-af982286dc59',
                  revision: 1,
                  path: 'clusterOne/one',
                  name: 'one',
                  selfLink: `providers/ovirt/${OVIRT_02_UID}/vms/6f9de857-ef39-43b7-8853-af982286dc59`,
                },
                children: null,
              },
            ],
          },
        ],
      },
    ],
  },
  [OVIRT_INSECURE_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'DataCenter',
        object: {
          id: '142a965b-6e50-4d4e-acd0-551671a1311f',
          name: 'Default',
          path: 'Default',
          revision: 1,
          selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/datacenters/142a965b-6e50-4d4e-acd0-551671a1311f`,
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: '68ba21a5-f458-460a-820e-edc6255a1239',
              revision: 1,
              name: 'theCluster',
              path: 'Default/theCluster',
              selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/clusters/68ba21a5-f458-460a-820e-edc6255a1239`,
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'fc12755e-9278-4472-96db-7b7232fbd825',
                  revision: 1,
                  name: 'host3.example.com',
                  path: 'theCluster/host3.example.com',
                  selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/hosts/fc12755e-9278-4472-96db-7b7232fbd825`,
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'bea5f184-972e-44e2-811a-2357829ab590',
                  revision: 1,
                  path: 'theCluster/demo-vm',
                  name: 'demo-vm',
                  selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/vms/bea5f184-972e-44e2-811a-2357829ab590`,
                },
                children: null,
              },
            ],
          },
        ],
      },
    ],
  },
  [OVIRT_03_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'DataCenter',
        object: {
          id: 'bfef987b-7521-4df2-a908-1981e45186a7',
          revision: 1,
          name: 'dc1',
          selfLink: `providers/${OVIRT_03_UID}/datacenters/bfef987b-7521-4df2-a908-1981e45186a7`,
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: '1b08f27b-18e2-41a4-99f5-a42ec688a42f',
              revision: 1,
              path: 'dc1/prod',
              name: 'prod',
              selfLink: `providers/ovirt/${OVIRT_03_UID}/clusters/1b08f27b-18e2-41a4-99f5-a42ec688a42f`,
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'ebe13310-0fef-45ce-af53-6488b6120959',
                  revision: 1,
                  path: 'prod/host4.example.com',
                  name: 'host4.example.com',
                  selfLink: `providers/ovirt/${OVIRT_03_UID}/hosts/ebe13310-0fef-45ce-af53-6488b6120959`,
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'b3eb91d4-2c42-4dc6-98fb-fee94f1df30d',
                  revision: 1,
                  path: 'prod/server.example.com',
                  name: 'server.example.com',
                  selfLink: `providers/ovirt/${OVIRT_03_UID}/vms/b3eb91d4-2c42-4dc6-98fb-fee94f1df30d`,
                },
                children: null,
              },
            ],
          },
        ],
      },
      {
        kind: 'DataCenter',
        object: {
          id: 'a8a9c500-0bdc-4a05-9961-4df0de0dc67c',
          revision: 1,
          name: 'dc2',
          selfLink: `providers/ovirt/${OVIRT_03_UID}/datacenters/a8a9c500-0bdc-4a05-9961-4df0de0dc67c`,
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'f7b169a3-583a-47bd-b115-5212dc66b4dc',
              revision: 1,
              path: 'dc2/test',
              name: 'test',
              selfLink: `providers/ovirt/${OVIRT_03_UID}/clusters/f7b169a3-583a-47bd-b115-5212dc66b4dc`,
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'dcdb1085-7297-4df6-88a1-74e50a83b813',
                  revision: 1,
                  path: 'dc2/backup',
                  name: 'backup',
                  selfLink: `providers/ovirt/${OVIRT_03_UID}/hosts/dcdb1085-7297-4df6-88a1-74e50a83b813`,
                },
                children: null,
              },
              {
                kind: 'Host',
                object: {
                  id: '7198e706-e3db-492c-91ac-bd3703665aa7',
                  revision: 1,
                  path: 'dc2/host5.example.com',
                  name: 'host5.example.com',
                  selfLink: `providers/ovirt/${OVIRT_03_UID}/hosts/7198e706-e3db-492c-91ac-bd3703665aa7`,
                },
                children: null,
              },
              {
                kind: 'VM',
                object: {
                  id: 'be55c259-2415-448d-841e-f4b9d743242e',
                  revision: 1,
                  path: 'dc2/engine',
                  name: 'engine',
                  selfLink: `providers/ovirt/${OVIRT_03_UID}/vms/be55c259-2415-448d-841e-f4b9d743242e`,
                },
                children: null,
              },
            ],
          },
        ],
      },
    ],
  },
};

export const MOCK_OPENSTACK_HOST_TREE: { [uid in OpenstackProviderIDs]: OpenstackTreeNode } = {
  [OPENSTACK_01_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Project',
        object: {
          id: '863df1446a134ec88581998d98912ff3',
          revision: 1,
          path: 'admin',
          name: 'admin',
          selfLink: `providers/openstack/${OPENSTACK_01_UID}/projects/863df1446a134ec88581998d98912ff3`,
          is_domain: false,
          description: 'Bootstrap project for initializing the cloud.',
          domain_id: 'default',
          enabled: true,
          parent_id: 'default',
        },
        children: [
          {
            kind: 'VM',
            object: {
              id: '231efc19-af42-47e3-ad13-eb6da01f2316',
              revision: 1,
              path: 'admin/cirros',
              name: 'cirros',
              selfLink: `providers/openstack/${OPENSTACK_01_UID}/vms/231efc19-af42-47e3-ad13-eb6da01f2316`,
            },
            children: null,
          },
        ],
      },
    ],
  },
  [OPENSTACK_02_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Project',
        object: {
          id: 'e4cd61a02dba448abc1db1b4462c6f38',
          revision: 1,
          path: 'services',
          name: 'services',
          selfLink: `providers/openstack/${OPENSTACK_02_UID}/projects/e4cd61a02dba448abc1db1b4462c6f38`,
          is_domain: false,
          description: '',
          domain_id: 'default',
          enabled: true,
          parent_id: 'default',
        },
        children: null,
      },
    ],
  },
};

export const MOCK_VMWARE_VM_TREE: { [uid in VmwareProviderIDs]: VSphereTreeNode } = {
  [VMWARE_01_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-2760',
          name: 'Fake_DC',
          selfLink: `providers/vsphere/${VMWARE_01_UID}/datacenters/datacenter-2760`,
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-21',
          name: 'V2V-DC',
          selfLink: `providers/vsphere/${VMWARE_01_UID}/datacenters/datacenter-21`,
        },
        children: [
          {
            kind: 'VM',
            object: {
              id: 'vm-2844',
              name: 'test-migration',
              selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-2844`,
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-431',
              name: 'pemcg-iscsi-target',
              selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-431`,
            },
            children: null,
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v1001',
              name: 'Workloads',
              selfLink: `providers/vsphere/${VMWARE_01_UID}/folders/group-v1001`,
            },
            children: [
              {
                kind: 'Folder',
                object: {
                  id: 'group-v2831',
                  name: 'Linux',
                  selfLink: `providers/vsphere/${VMWARE_01_UID}/folders/group-v2831`,
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1630',
                      name: 'test-migration',
                      selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-1630`,
                    },
                    children: null,
                  },
                ],
              },
              {
                kind: 'Folder',
                object: {
                  id: 'group-v2835',
                  name: 'jortel',
                  selfLink: `providers/vsphere/${VMWARE_01_UID}/folders/group-v2835`,
                },
                children: [
                  {
                    kind: 'Folder',
                    object: {
                      id: 'group-v2837',
                      name: 'Test',
                      selfLink: `providers/vsphere/${VMWARE_01_UID}/folders/group-v2837`,
                    },
                    children: [
                      {
                        kind: 'Folder',
                        object: {
                          id: 'group-v2838',
                          name: 'jortel',
                          selfLink: `providers/vsphere/${VMWARE_01_UID}/folders/group-v2838`,
                        },
                        children: [
                          {
                            kind: 'VM',
                            object: {
                              id: 'vm-1008',
                              name: 'test-migration-centos',
                              selfLink: `providers/vsphere/${VMWARE_01_UID}/vms/vm-1008`,
                            },
                            children: null,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  [VMWARE_02_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-2761',
          name: 'Fake_DC',
          selfLink: `providers/vsphere/${VMWARE_02_UID}/datacenter-2761`,
        },
        children: null,
      },
    ],
  },
  [VMWARE_03_UID]: {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-22',
          name: 'V2V-DC',
          selfLink: `providers/vsphere/${VMWARE_03_UID}/datacenters/datacenter-22`,
        },
        children: [
          {
            kind: 'Folder',
            object: {
              id: 'group-v72',
              name: 'Templates',
              selfLink: `providers/vsphere/${VMWARE_03_UID}/folders/group-v72`,
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-template-test',
                  name: 'vm-template-test',
                  selfLink: `providers/vsphere/${VMWARE_03_UID}/vms/vm-template-test`,
                },
                children: null,
              },
            ],
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v28',
              name: 'Discovered virtual machine',
              selfLink: `providers/vsphere/${VMWARE_03_UID}/folders/group-v28`,
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-2685',
                  name: 'pemcg-discovery01',
                  selfLink: `providers/vsphere/${VMWARE_03_UID}/vms/vm-2685`,
                },
                children: null,
              },
            ],
          },
        ],
      },
    ],
  },
};
