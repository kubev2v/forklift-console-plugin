import { INicProfile } from 'legacy/src/queries';
import { IRHVNIC } from 'legacy/src/queries/types';

const np1Id = '2ef3e5a3-974c-4a9c-9185-861cb049c966';
const np2Id = '5d69b6cd-6610-44e2-a55f-425035a260da';
const np3Id = '71c3bfa0-67da-4b5b-9ca8-41297f7cfba6';
const np4Id = 'f9db7fae-7b41-4037-ba7b-fafd53783272';
const np5Id = 'b63804a9-46f9-4015-ba6e-94784135430b';

export const MOCK_NICS: IRHVNIC[] = [
  {
    id: '1794dcdd-565d-43c7-824b-ba0074855a82',
    name: 'nic1',
    profile: np1Id,
  },
  {
    id: 'af66ab23-4edc-4f45-9f70-fb3541891d1a',
    name: 'nic2',
    profile: np2Id,
  },
  {
    id: '755a532d-51b3-428f-a795-1b3d97544fed',
    name: 'nic3',
    profile: np3Id,
  },
  {
    id: '0ee644d5-9976-470a-8524-e4048a97304c',
    name: 'nic4',
    profile: np4Id,
  },
  {
    id: 'd3ed0a91-6029-4e55-bfad-0e07891d35b1',
    name: 'nic5',
    profile: np5Id,
  },
];

export const MOCK_NIC_PROFILES: INicProfile[] = [
  {
    id: np1Id,
    revision: 1,
    name: 'TestNicProfile1',
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/nicprofiles/${np1Id}`,
    network: '1',
  },
  {
    id: np2Id,
    revision: 1,
    name: 'TestNicProfile2',
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/nicprofiles/${np2Id}`,
    network: '2',
  },
  {
    id: np3Id,
    revision: 1,
    name: 'TestNicProfile3',
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/nicprofiles/${np3Id}`,
    network: '3',
  },
  {
    id: np4Id,
    revision: 1,
    name: 'TestNicProfile4',
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/nicprofiles/${np4Id}`,
    network: '4',
  },
  {
    id: np5Id,
    revision: 1,
    name: 'TestNicProfile5',
    selfLink: `providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/nicprofiles/${np5Id}`,
    network: '5',
  },
];
