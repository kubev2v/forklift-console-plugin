import { ProvidersInventory } from '@kubev2v/types';

import { getMockData, MockDataRequestParameters, MockResponse } from '../getMockData';

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

  it('should return the correct type', () => {
    const requestParameters: MockDataRequestParameters = {
      pathname: '/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers',
    };

    const response = getMockData<ProvidersInventory>(requestParameters);

    expect(response.body.openshift[0].type).toBe('openshift');
  });
});
