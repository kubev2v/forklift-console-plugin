/* eslint-disable @cspell/spellchecker */
import { OVirtNIC, OVirtNicProfile } from '@kubev2v/types';

import { MOCK_RHV_NETWORKS } from './networks.mock';
import {
  OVIRT_01_UID,
  OVIRT_02_UID,
  OVIRT_03_UID,
  OVIRT_INSECURE_UID,
  OvirtProviderIDs,
} from './providers.mock';

const np1Id = '2ef3e5a3-974c-4a9c-9185-861cb049c966';
const np2Id = '5d69b6cd-6610-44e2-a55f-425035a260da';
const np3Id = '71c3bfa0-67da-4b5b-9ca8-41297f7cfba6';
const np4Id = 'f9db7fae-7b41-4037-ba7b-fafd53783272';
const np5Id = 'b63804a9-46f9-4015-ba6e-94784135430b';

export const MOCK_NICS: { [uid in OvirtProviderIDs]: OVirtNIC[] } = {
  [OVIRT_01_UID]: [
    {
      id: '1794dcdd-565d-43c7-824b-ba0074855a82',
      name: 'nic1',
      profile: np1Id,
      interface: 'virtio',
      plugged: true,
      ipAddress: null,
      mac: '00:1a:4a:16:01:1d',
    },
    {
      id: 'af66ab23-4edc-4f45-9f70-fb3541891d1a',
      name: 'nic2',
      profile: np2Id,
      interface: 'e1000',
      plugged: true,
      ipAddress: null,
      mac: '00:1a:4a:16:01:3f',
    },
  ],
  [OVIRT_02_UID]: [
    {
      id: '755a532d-51b3-428f-a795-1b3d97544fed',
      name: 'nic3',
      profile: np3Id,
      interface: 'virtio',
      plugged: true,
      ipAddress: null,
      mac: '00:1a:4a:16:01:8d',
    },
  ],
  [OVIRT_03_UID]: [
    {
      id: '0ee644d5-9976-470a-8524-e4048a97304c',
      name: 'nic4',
      profile: np4Id,
      interface: 'rtl8139',
      ipAddress: null,
      mac: '00:1a:4a:16:01:01',
      plugged: false,
    },
  ],
  [OVIRT_INSECURE_UID]: [
    {
      id: 'd3ed0a91-6029-4e55-bfad-0e07891d35b1',
      name: 'nic5',
      profile: np5Id,
      interface: 'virtio',
      plugged: true,
      ipAddress: null,
      mac: '00:1a:4a:16:01:02',
    },
  ],
};

export const MOCK_NIC_PROFILES: { [uid in OvirtProviderIDs]: OVirtNicProfile[] } = {
  [OVIRT_01_UID]: [
    {
      id: np1Id,
      revision: 1,
      name: 'ovirtmgmt',
      selfLink: `providers/ovirt/${OVIRT_01_UID}/nicprofiles/${np1Id}`,
      network: MOCK_RHV_NETWORKS[OVIRT_01_UID][0].id,
      networkFilter: '432bb52a-b2a1-11e8-a231-001a4a013f3d',
      portMirroring: false,
      qos: '',
      properties: [],
      passThrough: false,
    },
    {
      id: np2Id,
      revision: 1,
      name: 'qosn',
      selfLink: `providers/ovirt/${OVIRT_01_UID}/nicprofiles/${np2Id}`,
      network: MOCK_RHV_NETWORKS[OVIRT_01_UID][1].id,
      networkFilter: '432bb52a-b2a1-11e8-a231-001a4a013f3d',
      portMirroring: false,
      qos: 'e00fb4fb-e88e-4245-9b68-077db776d74c',
      properties: [],
      passThrough: false,
    },
  ],
  [OVIRT_02_UID]: [
    {
      id: np3Id,
      revision: 1,
      name: 'ovirtmgmt',
      selfLink: `providers/ovirt/${OVIRT_02_UID}/nicprofiles/${np3Id}`,
      network: MOCK_RHV_NETWORKS[OVIRT_02_UID][0].id,
      networkFilter: '432bb52a-b2a1-11e8-a231-001a4a013f3d',
      portMirroring: false,
      qos: '',
      properties: [],
      passThrough: false,
    },
  ],
  [OVIRT_03_UID]: [
    {
      id: np4Id,
      revision: 1,
      name: 'ovirtmgmt',
      selfLink: `providers/ovirt/${OVIRT_03_UID}/nicprofiles/${np4Id}`,
      network: MOCK_RHV_NETWORKS[OVIRT_03_UID][0].id,
      networkFilter: '432bb52a-b2a1-11e8-a231-001a4a013f3d',
      portMirroring: false,
      qos: '',
      properties: [],
      passThrough: false,
    },
  ],
  [OVIRT_INSECURE_UID]: [
    {
      id: np5Id,
      revision: 1,
      name: 'ovirtmgmt',
      selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/nicprofiles/${np5Id}`,
      network: MOCK_RHV_NETWORKS[OVIRT_INSECURE_UID][0].id,
      networkFilter: '432bb52a-b2a1-11e8-a231-001a4a013f3d',
      portMirroring: false,
      qos: '',
      properties: [],
      passThrough: false,
    },
  ],
};
