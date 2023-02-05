import { IMustGatherResponse } from 'legacy/src/client/types';

export const MOCK_MUST_GATHERS: IMustGatherResponse[] = [
  {
    id: 1,
    'created-at': '2021-08-16T12:11:20.955811-04:00',
    'updated-at': '2021-08-16T12:11:21.464347-04:00',
    'custom-name': 'plantest-03',
    status: 'inprogress',
    image: 'quay.io/konveyor/forklift-must-gather',
    'image-stream': '',
    'node-name': '',
    command: 'PLAN=plantest-03 /usr/bin/targeted',
    'source-dir': '',
    timeout: '20m',
    server: '',
    'archive-size': 0,
    'archive-name': 'must-gather-plantest-03.tar.gz',
    'exec-output': '',
  },
];
