import { IOpenShiftNamespace } from '../types/namespaces.types';

export let MOCK_OPENSHIFT_NAMESPACES: IOpenShiftNamespace[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_OPENSHIFT_NAMESPACES = [
    { selfLink: '/foo/namespace/1', name: 'openshift-migration' },
    { selfLink: '/foo/namespace/2', name: 'example-project' },
    { selfLink: '/foo/namespace/3', name: 'test-namespace' },
    { selfLink: '/foo/namespace/4', name: 'x-namespace-4' },
    { selfLink: '/foo/namespace/5', name: 'x-namespace-5' },
  ];
}
