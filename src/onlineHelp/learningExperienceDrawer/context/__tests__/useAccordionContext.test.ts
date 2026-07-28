import { act, renderHook } from '@testing-library/react';

import { useAccordionContext } from '../useAccordionContext';

import { testItemId, testItemId2 } from './constants';
import { createMockPersistedState, mockPersistValue, setupMocks } from './utils';

jest.mock('../../utils/utils', () => ({
  findTopicById: jest.fn(),
  persistValue: jest.fn(),
}));

jest.mock('@utils/userSettingsHelpers', () => ({
  parseOrClean: jest.fn(),
}));

describe('useAccordionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it('returns empty openExpansionItems by default', () => {
    const { result } = renderHook(() => useAccordionContext());

    expect(result.current.openExpansionItems).toEqual([]);
  });

  it('restores openExpansionItems from storage', () => {
    const storedItems = [testItemId, testItemId2];
    setupMocks(createMockPersistedState({ openExpansionItems: storedItems }));

    const { result } = renderHook(() => useAccordionContext());

    expect(result.current.openExpansionItems).toEqual(storedItems);
  });

  it('openExpansionItem adds item and persists', () => {
    const { result } = renderHook(() => useAccordionContext());

    act(() => {
      result.current.openExpansionItem(testItemId);
    });

    expect(result.current.openExpansionItems).toContain(testItemId);
    expect(mockPersistValue).toHaveBeenCalledWith('openExpansionItems', [testItemId]);
  });

  it('openExpansionItem does not duplicate existing item', () => {
    setupMocks(createMockPersistedState({ openExpansionItems: [testItemId] }));

    const { result } = renderHook(() => useAccordionContext());

    act(() => {
      result.current.openExpansionItem(testItemId);
    });

    expect(result.current.openExpansionItems.filter((id) => id === testItemId)).toHaveLength(1);
  });

  it('closeExpansionItem removes item and persists', () => {
    setupMocks(createMockPersistedState({ openExpansionItems: [testItemId, testItemId2] }));

    const { result } = renderHook(() => useAccordionContext());

    act(() => {
      result.current.closeExpansionItem(testItemId);
    });

    expect(result.current.openExpansionItems).not.toContain(testItemId);
    expect(result.current.openExpansionItems).toContain(testItemId2);
    expect(mockPersistValue).toHaveBeenCalledWith('openExpansionItems', [testItemId2]);
  });

  it('closeExpansionItem handles non-existent item gracefully', () => {
    setupMocks(createMockPersistedState({ openExpansionItems: [testItemId] }));

    const { result } = renderHook(() => useAccordionContext());

    act(() => {
      result.current.closeExpansionItem('non-existent-id');
    });

    expect(result.current.openExpansionItems).toEqual([testItemId]);
  });
});
