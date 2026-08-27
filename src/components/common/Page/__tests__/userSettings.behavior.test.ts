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

    expect(settings).toEqual(
      expect.objectContaining({
        fields: expect.objectContaining({ data: [] }),
        filters: expect.objectContaining({ data: {} }),
        pagination: expect.objectContaining({ perPage: DEFAULT_PER_PAGE }),
      }),
    );
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
    expect(settings).toEqual(
      expect.objectContaining({
        fields: expect.objectContaining({
          data: [{ isVisible: true, resourceFieldId: 'name' }],
        }),
        filters: expect.objectContaining({ data: { name: ['a'] } }),
        pagination: expect.objectContaining({ perPage: 50 }),
      }),
    );
  });

  it('removes invalid JSON from storage', () => {
    mockLoad.mockReturnValue('{not-json');
    const settings = loadUserSettings({ pageId: 'broken' });
    expect(mockRemove).toHaveBeenCalledWith('forklift/broken');
    expect(settings).toEqual(
      expect.objectContaining({
        fields: expect.objectContaining({ data: [] }),
      }),
    );
  });

  it('saves and clears fields/filters/pagination', () => {
    mockLoad.mockReturnValue(JSON.stringify({ fields: [], filters: { a: 1 }, perPage: 20 }));
    const { fields, filters, pagination } = loadUserSettings({ pageId: 'x' });

    expect(fields).toBeDefined();
    expect(filters).toBeDefined();
    expect(pagination).toBeDefined();
    if (!fields || !filters || !pagination) {
      throw new Error('Expected fields, filters, and pagination to be defined');
    }

    const nextFields = [{ isVisible: true, resourceFieldId: 'name' }];
    fields.save(nextFields);
    expect(mockSave).toHaveBeenCalledWith(
      'forklift/x',
      JSON.stringify({ fields: nextFields, filters: { a: 1 }, perPage: 20 }),
    );

    fields.clear();
    expect(mockSave).toHaveBeenCalledWith(
      'forklift/x',
      JSON.stringify({ filters: { a: 1 }, perPage: 20 }),
    );

    mockLoad.mockReturnValue(JSON.stringify({}));
    filters.clear();
    expect(mockRemove).toHaveBeenCalledWith('forklift/x');

    pagination.save(100);
    expect(mockSave).toHaveBeenCalledWith('forklift/x', JSON.stringify({ perPage: 100 }));
  });
});
