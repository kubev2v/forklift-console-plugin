/* eslint-disable @cspell/spellchecker */
import { MustGatherResponse } from '@kubev2v/types';

import { EPOCH } from '../utils';

export const MOCK_MUST_GATHERS: MustGatherResponse[] = [
  {
    id: 1,
    'created-at': EPOCH.toISO(),
    'updated-at': EPOCH.toISO(),
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
