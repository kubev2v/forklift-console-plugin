import type { V1beta1Provider } from '@forklift-ui/types';

import { PROVIDER_NAME_LABEL, PROVIDER_UID_LABEL } from '../../models';
import { isValidationForProvider } from '../isValidationForProvider';

describe('isValidationForProvider', () => {
  const provider = {
    metadata: { name: 'remote-cnv', namespace: 'openshift-mtv', uid: 'provider-uid' },
  } as V1beta1Provider;

  it('matches the Provider UID label', () => {
    expect(
      isValidationForProvider(
        { metadata: { labels: { [PROVIDER_UID_LABEL]: 'provider-uid' } } },
        provider,
      ),
    ).toBe(true);
  });

  it('falls back to the Provider name label when its UID is unavailable', () => {
    const providerWithoutUID = {
      metadata: { name: 'remote-cnv', namespace: 'openshift-mtv' },
    } as V1beta1Provider;

    expect(
      isValidationForProvider(
        { metadata: { labels: { [PROVIDER_NAME_LABEL]: 'remote-cnv' } } },
        providerWithoutUID,
      ),
    ).toBe(true);
  });

  it('does not match a reused Provider name with another UID', () => {
    expect(
      isValidationForProvider(
        {
          metadata: {
            labels: {
              [PROVIDER_NAME_LABEL]: 'remote-cnv',
              [PROVIDER_UID_LABEL]: 'old-provider-uid',
            },
          },
        },
        provider,
      ),
    ).toBe(false);
  });
});
