import type { V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { resolveProvider } from '../resolveProvider';

const providerWithUid = (uid: string): V1beta1Provider =>
  ({ metadata: { uid } }) as V1beta1Provider;

const providerWithoutUid = (): V1beta1Provider => ({ metadata: {} }) as V1beta1Provider;

describe('resolveProvider', () => {
  it('returns watched provider when loaded with uid', () => {
    const watched = providerWithUid('watched');
    const launched = providerWithUid('launched');

    expect(resolveProvider(watched, true, launched)).toBe(watched);
  });

  it('falls back to launched when loaded without uid', () => {
    const launched = providerWithUid('launched');

    expect(resolveProvider(providerWithoutUid(), true, launched)).toBe(launched);
  });

  it('falls back to launched when watch is not loaded yet', () => {
    const watched = providerWithUid('watched');
    const launched = providerWithUid('launched');

    expect(resolveProvider(watched, false, launched)).toBe(launched);
  });

  it('returns undefined when neither watched nor launched has a uid', () => {
    expect(resolveProvider(providerWithoutUid(), true, providerWithoutUid())).toBeUndefined();
    expect(resolveProvider(undefined, false, undefined)).toBeUndefined();
  });
});
