import { readFileSync } from 'fs';

import { RequestHandler, MockedRequest, ResponseComposition, rest, RestContext } from 'msw';

/**
 * Reverts Console proxy mappings and transforms to relative paths.
 *
 * MSW routes(and HAR files) are browser oriented: they use paths produced by the Console.
 * However the mock server is placed BEFORE the console proxy so we need to revert all the mappings done by the Console.
 *
 * Traffic recorded in the HAR files uses absolute URLs (i.e. starting with http://localhost:9000/api/...).
 * The original host is removed from the URL via prefix map.
 */
export const replacePrefix = (url: string, prefixMap: Record<string, string>) => {
  const [prefix, replacement] =
    Object.entries(prefixMap).find(([prefix]) => url.startsWith(prefix)) || [];
  return prefix ? url.replace(prefix, replacement) : url;
};

const replaceSearch = (url: string) => {
  const parsedUrl = new URL(url);
  return parsedUrl.href.replace(parsedUrl.search, '');
};

export const createHandlersFromHar = (
  harFile: string,
  prefixMap: Record<string, string>,
): RequestHandler[] =>
  getEntriesFromArchive(JSON.parse(readFileSync(harFile, 'utf-8')))
    .map(({ request, ...rest }) => ({
      ...rest,
      request: { ...request, url: replacePrefix(replaceSearch(request.url), prefixMap) },
    }))
    .map((entry) => createRequestHandler(entry))
    .filter(Boolean);

const getEntriesFromArchive = (definition) => definition?.log?.entries ?? definition?.entries ?? [];

const createRequestHandler = ({ request, response }) => {
  if (request?.method?.toLowerCase() !== 'get' || !response || !request.url) {
    return null;
  }

  console.log(`Registering route for ${request.method} for ${request.url})`);

  return rest.get(request.url, (req: MockedRequest, res: ResponseComposition, ctx: RestContext) =>
    res(ctx.status(response.status ?? 404), ctx.body(response.content?.text ?? '')),
  );
};
