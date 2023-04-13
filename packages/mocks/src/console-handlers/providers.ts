import { rest, RestHandler } from 'msw';

import { createResource, ForkliftResourceKind } from '@kubev2v/legacy/client/helpers';
import { IKubeList } from '@kubev2v/legacy/client/types';
import { CLUSTER_API_VERSION } from '@kubev2v/legacy/common/constants';
import { IProviderObject } from '@kubev2v/legacy/queries/types';

import { MOCK_INVENTORY_PROVIDERS } from '../mocks/providers.mock';

import { fancyCaptureUrl } from './util';

const mockClusterProviders = (namespace?: string): IKubeList<IProviderObject> => {
  const items = Object.values(MOCK_INVENTORY_PROVIDERS)
    .flat()
    .filter((provider) => (namespace ? provider.namespace === namespace : true))
    .map((provider) => provider.object);

  return {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Providers',
    metadata: {
      continue: '',
      resourceVersion: '',
      selfLink: '/foo/list/selfLink',
    },
    items,
  };
};

// these ultimately rely on @migtools/lib-ui for path generation
const providerClusterResource = createResource(ForkliftResourceKind.Provider, '');

const providerNamespacedResource = createResource(ForkliftResourceKind.Provider, ':namespace');

const getInventoryApiUrl = (relativePath?: string): string =>
  `/api/proxy/plugin/forklift-console-plugin/forklift-inventory/${relativePath || ''}`;

/**
 * These handler paths should be from the perspective of the plugin running on console.
 *
 * The intention is to have handlers for every providers based query and mutation
 * present in `packages/legacy/src/queries/providers.ts`.
 */
export const handlers: RestHandler[] = [
  // support `useClusterProvidersQuery` (cluster and namespaced)
  rest.get(providerClusterResource.listPath(), (req, res, ctx) => {
    console.log(...fancyCaptureUrl(req.url));
    return res(ctx.json(mockClusterProviders()));
  }),

  rest.get(providerNamespacedResource.listPath(), (req, res, ctx) => {
    console.log(...fancyCaptureUrl(req.url));
    const { namespace } = req.params;
    const _namespace = Array.isArray(namespace) ? namespace[0] : namespace;
    return res(ctx.json(mockClusterProviders(_namespace)));
  }),

  // support `useInventoryProvidersQuery`
  rest.get(getInventoryApiUrl('providers'), (req, res, ctx) => {
    const detail = req.url.searchParams.get('detail');
    console.log(...fancyCaptureUrl(req.url), `detail=${detail}`);
    return res(ctx.json(MOCK_INVENTORY_PROVIDERS));
  }),

  // TODO: support `useCreateProviderMutation`

  // TODO: support `usePatchProviderMutation`

  // TODO: support `useDeleteProviderMutation`

  // TODO: support `useHasSufficientProvidersQuery`

  // TODO: support `useOCPMigrationNetworkMutation`
];
