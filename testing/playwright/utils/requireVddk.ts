import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type SkippableTest = {
  skip: (condition: boolean, description: string) => void;
};

type ProviderEntry = {
  vddk_init_image?: string;
};

/**
 * Returns true when the active vSphere provider config has a VDDK init image
 * configured in .providers.json.  Deep inspection and cold migration tests
 * require a VDDK image — without it the plan/provider shows "Cannot start".
 */
export const isVddkConfigured = (): boolean => {
  const providersFile = join(__dirname, '../../.providers.json');

  if (!existsSync(providersFile)) return false;

  try {
    const providers = JSON.parse(readFileSync(providersFile, 'utf8')) as Record<
      string,
      ProviderEntry
    >;
    const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
    return Boolean(providers[providerKey]?.vddk_init_image);
  } catch {
    return false;
  }
};

/**
 * Skip a test (or describe block) when the active vSphere provider is not
 * configured with a VDDK init image.
 *
 * Usage (at describe or test level):
 *   requireVddk(test);
 */
export const requireVddk = (testObj: SkippableTest): void => {
  const providerKey = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
  testObj.skip(
    !isVddkConfigured(),
    `Test requires vddk_init_image to be set in .providers.json for provider "${providerKey}". ` +
      'Without VDDK, plans remain in "Cannot start" state.',
  );
};
