import { DEFAULT_PER_PAGE } from '@components/common/Page/usePagination';

import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '../../utils/localStorage';
import { loadUserSettings } from '../userSettings';

jest.mock('../../utils/localStorage', (): unknown => ({
  loadFromLocalStorage: jest.fn(),
  removeFromLocalStorage: jest.fn(),
  saveToLocalStorage: jest.fn(),
}));

const mockLoad = loadFromLocalStorage as jest.MockedFunction<typeof loadFromLocalStorage>;
const mockSave = saveToLocalStorage as jest.MockedFunction<typeof saveToLocalStorage>;
const mockRemove = removeFromLocalStorage as jest.MockedFunction<typeof removeFromLocalStorage>;

describe('userSettings - behavior', () => {
  const originalPlugin = process.env.PLUGIN_NAME;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PLUGIN_NAME = 'forklift';
  });

  afterAll(() => {
    process.env.PLUGIN_NAME = originalPlugin;
  });

  it('returns defaults when storage is empty', () => {
    mockLoad.mockReturnValue(null);
    const settings = loadUserSettings({ pageId: 'providers' });

    expect(settings.fields.data).toEqual([]);
    expect(settings.filters.data).toEqual({});
    expect(settings.pagination.perPage).toBe(DEFAULT_PER_PAGE);
  });

  it('sanitizes fields and keeps valid perPage/filters', () => {
    mockLoad.mockReturnValue(
      JSON.stringify({
        fields: [{ isVisible: true, resourceFieldId: 'name' }, { isVisible: false }, null, 'bad'],
        filters: { name: ['a'] },
        perPage: 50,
      }),
    );

    const settings = loadUserSettings({ pageId: 'plans' });
    expect(settings.fields.data).toEqual([{ isVisible: true, resourceFieldId: 'name' }]);
    expect(settings.filters.data).toEqual({ name: ['a'] });
    expect(settings.pagination.perPage).toBe(50);
  });

  it('removes invalid JSON from storage', () => {
    mockLoad.mockReturnValue('{not-json');
    const settings = loadUserSettings({ pageId: 'broken' });
    expect(mockRemove).toHaveBeenCalledWith('forklift/broken');
    expect(settings.fields.data).toEqual([]);
  });

  it('saves and clears fields/filters/pagination', () => {
    mockLoad.mockReturnValue(JSON.stringify({ fields: [], filters: { a: 1 }, perPage: 20 }));
    const settings = loadUserSettings({ pageId: 'x' });

    settings.fields.save([{ isVisible: true, resourceFieldId: 'name' }]);
    expect(mockSave).toHaveBeenCalled();

    settings.fields.clear();
    expect(mockSave).toHaveBeenCalledWith('forklift/x', expect.stringContaining('filters'));

    mockLoad.mockReturnValue(JSON.stringify({}));
    settings.filters.clear();
    expect(mockRemove).toHaveBeenCalledWith('forklift/x');

    settings.pagination.save(100);
    expect(mockSave).toHaveBeenCalledWith('forklift/x', expect.stringContaining('100'));
  });
});
