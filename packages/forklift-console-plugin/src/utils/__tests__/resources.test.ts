import { resolveProviderRef } from '../resources';

describe('finding object ref', () => {
  test('fallback to default ref if no matching provider', () => {
    expect(resolveProviderRef({ name: 'Foo', namespace: 'Bar' }, [])).toEqual({
      name: 'Foo',
      resolved: false,
      gvk: {
        group: 'forklift.konveyor.io',
        version: 'v1beta1',
        kind: 'Provider',
      },
      ready: false,
    });
  });
  test('finding matching provider', () => {
    expect(
      resolveProviderRef({ name: 'test', namespace: 'openshift-migration' }, [
        {
          apiVersion: 'foo.io/v2',
          kind: 'Provider',
          metadata: {
            name: 'test',
            namespace: 'openshift-migration',
          },
          status: {
            conditions: [
              {
                category: 'Required',
                lastTransitionTime: '2021-03-23T16:58:23Z',
                message: 'The provider is ready.',
                status: 'True',
                type: 'Ready',
              },
            ],
          },
        },
      ]),
    ).toEqual({
      name: 'test',
      resolved: true,
      gvk: {
        group: 'foo.io',
        version: 'v2',
        kind: 'Provider',
      },
      ready: true,
    });
  });
});
