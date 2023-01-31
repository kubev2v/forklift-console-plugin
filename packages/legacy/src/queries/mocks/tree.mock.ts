import { IInventoryHostTree, IVMwareFolderTree } from '../types/tree.types';

export let MOCK_VMWARE_HOST_TREE: IInventoryHostTree = {
  kind: '',
  object: null,
  children: null,
};

export let MOCK_RHV_HOST_TREE: IInventoryHostTree = {
  kind: '',
  object: null,
  children: null,
};

export let MOCK_VMWARE_VM_TREE: IVMwareFolderTree = {
  kind: '',
  object: null,
  children: null,
};

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_VMWARE_HOST_TREE = {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: '',
          name: 'Fake_DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-2760',
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: '',
          name: 'V2V-DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-21',
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: 'domain-c26',
              name: 'V2V_Cluster',
              selfLink: '/providers/vsphere/test4/clusters/domain-c26',
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'host-29',
                  name: 'esx13.v2v.bos.redhat.com',
                  selfLink: '/providers/vsphere/test4/hosts/host-29',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1630',
                      name: 'fdupont-test-migration',
                      selfLink: '/providers/vsphere/test/vms/vm-1630',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-template-test',
                      name: 'vm-template-test',
                      selfLink: '/providers/vsphere/test/vms/vm-template-test',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2844',
                      name: 'fdupont%2ftest',
                      selfLink: '/providers/vsphere/test/vms/vm-2844',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1008',
                      name: 'fdupont-test-migration-centos',
                      selfLink: '/providers/vsphere/test/vms/vm-1008',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-2685',
                      name: 'pemcg-discovery01',
                      selfLink: '/providers/vsphere/test/vms/vm-2685',
                    },
                    children: null,
                  },
                ],
              },
            ],
          },
          {
            kind: 'Cluster',
            object: {
              id: 'domain-c2758',
              name: 'Fake_Cluster',
              selfLink: '/providers/vsphere/test4/clusters/domain-c2758',
            },
            children: null,
          },
          {
            kind: 'Cluster',
            object: {
              id: 'domain-s8928',
              variant: 'ComputeResource',
              name: 'fake-host',
              selfLink:
                '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/clusters/domain-s8928',
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'host-8930',
                  name: 'fake-host',
                  selfLink:
                    '/providers/vsphere/fa7df6b4-a5bf-4703-b078-1dc0dc4a4bfd/hosts/host-8930',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-431',
                      name: 'pemcg-iscsi-target',
                      selfLink: '/providers/vsphere/test/vms/vm-431',
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
  };

  MOCK_RHV_HOST_TREE = {
    kind: '',
    object: null,
    children: [
      {
        kind: 'DataCenter',
        object: {
          id: '30528e0a-23eb-11e8-805f-00163e18b6f7',
          name: 'Default',
          selfLink:
            'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/datacenters/30528e0a-23eb-11e8-805f-00163e18b6f7',
        },
        children: [
          {
            kind: 'Cluster',
            object: {
              id: '3053b92e-23eb-11e8-959c-00163e18b6f7',
              name: 'The infrastructure server cluster',
              selfLink:
                'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/clusters/3053b92e-23eb-11e8-959c-00163e18b6f7',
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: 'c75a349c-a429-4afc-83cc-44fbd6447758',
                  name: 'rhelh14.v2v.bos.redhat.com',
                  selfLink:
                    'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/hosts/c75a349c-a429-4afc-83cc-44fbd6447758',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: '3dcaf3ec-6b51-4ca0-8345-6d61841731d7',
                      name: 'fdupont-cfme-5.11.9.0-1',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/3dcaf3ec-6b51-4ca0-8345-6d61841731d7',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: '2a66a719-440c-4544-9da0-692d14338b12',
                      name: 'fdupont-dev-rhel8',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/2a66a719-440c-4544-9da0-692d14338b12',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: '64333a40-ffbb-4c28-add7-5560bdf082fb',
                      name: 'fdupont-manageiq-dev',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/64333a40-ffbb-4c28-add7-5560bdf082fb',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: '6f9de857-ef39-43b7-8853-af982286dc59',
                      name: 'jenkins-me.v2v.bos.redhat.com',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/6f9de857-ef39-43b7-8853-af982286dc59',
                    },
                    children: null,
                  },
                ],
              },
              {
                kind: 'Host',
                object: {
                  id: '1b71b05f-ad57-4568-a3b0-83672d125ad8',
                  name: 'rhelh15.v2v.bos.redhat.com',
                  selfLink:
                    'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/hosts/1b71b05f-ad57-4568-a3b0-83672d125ad8',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'bea5f184-972e-44e2-811a-2357829ab590',
                      name: 'demo-cfme-5.11.7.3-1',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/bea5f184-972e-44e2-811a-2357829ab590',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'b3eb91d4-2c42-4dc6-98fb-fee94f1df30d',
                      name: 'dhcp.v2v.bos.redhat.com',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/b3eb91d4-2c42-4dc6-98fb-fee94f1df30d',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'be55c259-2415-448d-841e-f4b9d743242e',
                      name: 'HostedEngine',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/be55c259-2415-448d-841e-f4b9d743242e',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: '54426696-297d-4ae4-a2a3-c7bc43ee5ccf',
                      name: 'ipam.v2v.bos.redhat.com',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/54426696-297d-4ae4-a2a3-c7bc43ee5ccf',
                    },
                    children: null,
                  },
                ],
              },
            ],
          },
          {
            kind: 'Cluster',
            object: {
              id: '0edb53fa-232e-4145-8184-946a3736b251',
              name: 'V2V Project Cluster',
              selfLink:
                'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/clusters/0edb53fa-232e-4145-8184-946a3736b251',
            },
            children: [
              {
                kind: 'Host',
                object: {
                  id: '89f2f214-6d50-47e7-8e3f-6c2694ca4546',
                  name: 'rhelh08.v2v.bos.redhat.com',
                  selfLink:
                    'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/hosts/89f2f214-6d50-47e7-8e3f-6c2694ca4546',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: '84d2359c-45d3-401f-a942-81020d6a58bd',
                      name: 'jlabocki-master-1',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/84d2359c-45d3-401f-a942-81020d6a58bd',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: '25284d90-3684-4643-8f60-c72cc8ccfbff',
                      name: 'jlabocki-master-3',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/25284d90-3684-4643-8f60-c72cc8ccfbff',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'aa6eca14-b91d-447f-8050-4a7127d33244',
                      name: 'jlabocki-swarm-2',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/aa6eca14-b91d-447f-8050-4a7127d33244',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'cdb41d1c-481a-4d24-a239-fe77813608cd',
                      name: 'jlabocki-worker-1',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/cdb41d1c-481a-4d24-a239-fe77813608cd',
                    },
                    children: null,
                  },
                ],
              },
              {
                kind: 'Host',
                object: {
                  id: '31a5d317-8563-4824-9954-cf0b44a1596a',
                  name: 'rhelh09.v2v.bos.redhat.com',
                  selfLink:
                    'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/hosts/31a5d317-8563-4824-9954-cf0b44a1596a',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'fe91d819-94e4-4e77-8d8d-399484601937',
                      name: 'bthurber-kvm0.v2v.bos.redhat.com',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/fe91d819-94e4-4e77-8d8d-399484601937',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: '18d82ffd-8c1a-407a-a2c4-119b6d81375a',
                      name: 'jlabocki-centos',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/18d82ffd-8c1a-407a-a2c4-119b6d81375a',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: 'f9ee4c85-e880-48eb-86d4-639bf2956049',
                      name: 'jlabocki-master-2',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/f9ee4c85-e880-48eb-86d4-639bf2956049',
                    },
                    children: null,
                  },
                  {
                    kind: 'VM',
                    object: {
                      id: '35c259ac-603a-458e-81f6-8d9ed3a8e1ee',
                      name: 'jlabocki-swarm-1',
                      selfLink:
                        'providers/ovirt/85292227-48fc-4571-a2ea-ba1f04634bc9/vms/35c259ac-603a-458e-81f6-8d9ed3a8e1ee',
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
  };

  MOCK_VMWARE_VM_TREE = {
    kind: '',
    object: null,
    children: [
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-2760',
          name: 'Fake_DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-2760',
        },
        children: null,
      },
      {
        kind: 'Datacenter',
        object: {
          id: 'datacenter-21',
          name: 'V2V-DC',
          selfLink: '/providers/vsphere/test4/datacenters/datacenter-21',
        },
        children: [
          {
            kind: 'VM',
            object: {
              id: 'vm-2844',
              name: 'fdupont%2ftest',
              selfLink: '/providers/vsphere/test/vms/vm-2844',
            },
            children: null,
          },
          {
            kind: 'VM',
            object: {
              id: 'vm-431',
              name: 'pemcg-iscsi-target',
              selfLink: '/providers/vsphere/test/vms/vm-431',
            },
            children: null,
          },
          {
            kind: 'Folder',
            object: {
              id: 'group-v1001',
              name: 'Workloads',
              selfLink: '/providers/vsphere/test4/folders/group-v1001',
            },
            children: [
              {
                kind: 'Folder',
                object: {
                  id: 'group-v2831',
                  name: 'Linux',
                  selfLink: '/providers/vsphere/test4/folders/group-v2831',
                },
                children: [
                  {
                    kind: 'VM',
                    object: {
                      id: 'vm-1630',
                      name: 'fdupont-test-migration',
                      selfLink: '/providers/vsphere/test/vms/vm-1630',
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
                  selfLink: '/providers/vsphere/test4/folders/group-v2835',
                },
                children: [
                  {
                    kind: 'Folder',
                    object: {
                      id: 'group-v2837',
                      name: 'Test',
                      selfLink: '/providers/vsphere/test4/folders/group-v2837',
                    },
                    children: [
                      {
                        kind: 'Folder',
                        object: {
                          id: 'group-v2838',
                          name: 'jortel',
                          selfLink: '/providers/vsphere/test4/folders/group-v2838',
                        },
                        children: [
                          {
                            kind: 'VM',
                            object: {
                              id: 'vm-1008',
                              name: 'fdupont-test-migration-centos',
                              selfLink: '/providers/vsphere/test/vms/vm-1008',
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
          {
            kind: 'Folder',
            object: {
              id: 'group-v72',
              name: 'Templates',
              selfLink: '/providers/vsphere/test4/folders/group-v72',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-template-test',
                  name: 'vm-template-test',
                  selfLink: '/providers/vsphere/test/vms/vm-template-test',
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
              selfLink: '/providers/vsphere/test4/folders/group-v28',
            },
            children: [
              {
                kind: 'VM',
                object: {
                  id: 'vm-2685',
                  name: 'pemcg-discovery01',
                  selfLink: '/providers/vsphere/test/vms/vm-2685',
                },
                children: null,
              },
            ],
          },
        ],
      },
    ],
  };
}
