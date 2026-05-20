import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { SkippableTest } from '../version/types';

const PROVIDERS_FILE = join(__dirname, '../../../.providers.json');

const SKIP_MESSAGE = 'Skipped: no EC2 provider in .providers.json (non-AWS cluster)';

/**
 * Returns true when .providers.json contains at least one entry with type "ec2".
 * The presence of such an entry indicates the cluster is running on AWS.
 */
const isAwsPlatform = (): boolean => {
  if (!existsSync(PROVIDERS_FILE)) return false;

  try {
    const providers = JSON.parse(readFileSync(PROVIDERS_FILE, 'utf-8')) as Record<
      string,
      { type?: string }
    >;
    return Object.values(providers).some((provider) => provider.type === 'ec2');
  } catch {
    return false;
  }
};

export const requireAwsPlatform = (testObj: SkippableTest): void => {
  testObj.skip(!isAwsPlatform(), SKIP_MESSAGE);
};
