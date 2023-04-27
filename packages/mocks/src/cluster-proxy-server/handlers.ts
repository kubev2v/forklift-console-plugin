import {
  DefaultBodyType,
  RequestHandler,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from 'msw';

import { replacePrefix } from './utils';

const openshiftProvider1 = {
  uid: 'mock-uid-ocpv-1',
  namespace: 'openshift-migration',
  name: 'ocpv-1',
  selfLink: '/foo/openshiftprovider/1',
  type: 'openshift',
  vmCount: 26,
  networkCount: 8,
};

export const createDefaultHandlers = (prefixMap: Record<string, string>): RequestHandler[] =>
  [
    {
      url: '/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers',
      resolver: (req: RestRequest, res: ResponseComposition<DefaultBodyType>, ctx: RestContext) =>
        res(
          ctx.status(200),
          ctx.json({
            vsphere: [],
            ovirt: [],
            openstack: [],
            openshift: [openshiftProvider1],
          }),
        ),
    },
  ].map(({ url, resolver }) => rest.get(replacePrefix(url, prefixMap), resolver));
