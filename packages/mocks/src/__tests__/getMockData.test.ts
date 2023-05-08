import {
  getMockData,
  MockDataRequestParameters,
  MockResponse,
  replaceNamespaceInPath,
} from '../getMockData';

describe('getMockData', () => {
  it('should return the correct mock response when the pathname matches', () => {
    const requestParameters: MockDataRequestParameters = {
      pathname: '/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers',
    };

    const response: MockResponse | null = getMockData(requestParameters);

    expect(response).not.toBeNull();
    expect(response).toEqual({
      statusCode: 200,
      body: expect.any(Object),
    });
  });

  it('should return null when the pathname does not match', () => {
    const requestParameters: MockDataRequestParameters = {
      pathname: '/api/non-existent-path',
    };

    const response: MockResponse | null = getMockData(requestParameters);

    expect(response).toBeNull();
  });
});

describe('replaceNamespaceInPath', () => {
  it('replaces any namespace with the new namespace in the path', () => {
    const oldPath = '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/old/migrations';
    const newNamespace = 'new';
    const expectedPath =
      '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/new/migrations';

    const actualPath = replaceNamespaceInPath(oldPath, newNamespace);
    expect(actualPath).toEqual(expectedPath);
  });

  it('returns the path unchanged if it does not contain a namespace', () => {
    const path = '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/pods';
    const newNamespace = 'new';

    const actualPath = replaceNamespaceInPath(path, newNamespace);
    expect(actualPath).toEqual(path);
  });

  it('returns the path unchanged if it contains an invalid namespace format', () => {
    const path = '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces//migrations';
    const newNamespace = 'new';

    const actualPath = replaceNamespaceInPath(path, newNamespace);
    expect(actualPath).toEqual(path);
  });
});
