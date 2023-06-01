import { isDataSourceMock, MSW_MOCK_SOURCES } from '../getMockData';

describe('isDataSourceMock test', () => {
  test.each(MSW_MOCK_SOURCES)('Mock data source %s', (mockSource) => {
    expect(isDataSourceMock(mockSource)).toBeTruthy();
  });

  it('rejects legacy mock source', () => {
    expect(isDataSourceMock('mock')).toBeFalsy();
  });

  it('rejects non-mock source', () => {
    expect(isDataSourceMock('remote')).toBeFalsy();
  });

  it('detects mock source with data set', () => {
    expect(isDataSourceMock('code:basic')).toBeTruthy();
  });
});
