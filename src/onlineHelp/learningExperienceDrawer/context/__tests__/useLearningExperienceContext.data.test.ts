import { act, renderHook } from '@testing-library/react';

import { useLearningExperienceContext } from '../useLearningExperienceContext';

import { createMockPersistedState, mockPersistValue, setupMocks } from './utils';

jest.mock('../../utils/utils', () => ({
  findTopicById: jest.fn(),
  persistValue: jest.fn(),
}));

jest.mock('@utils/userSettingsHelpers', () => ({
  parseOrClean: jest.fn(),
}));

describe('useLearningExperienceContext - data management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it('setData adds new data item and persists', () => {
    const { result } = renderHook(() => useLearningExperienceContext());

    act(() => {
      result.current.setData('newKey', 'newValue');
    });

    expect(result.current.data.newKey).toBe('newValue');
    expect(mockPersistValue).toHaveBeenCalledWith(
      'data',
      expect.objectContaining({ newKey: 'newValue' }),
    );
  });

  it('setData updates existing data item and persists', () => {
    setupMocks(createMockPersistedState({ data: { existingKey: 'oldValue' } }));

    const { result } = renderHook(() => useLearningExperienceContext());

    act(() => {
      result.current.setData('existingKey', 'updatedValue');
    });

    expect(result.current.data.existingKey).toBe('updatedValue');
    expect(mockPersistValue).toHaveBeenCalledWith(
      'data',
      expect.objectContaining({ existingKey: 'updatedValue' }),
    );
  });

  it('clearData with key clears specific item', () => {
    setupMocks(createMockPersistedState({ data: { key1: 'value1', key2: 'value2' } }));

    const { result } = renderHook(() => useLearningExperienceContext());

    act(() => {
      result.current.clearData('key1');
    });

    expect(result.current.data.key1).toBeUndefined();
    expect(result.current.data.key2).toBe('value2');
  });

  it('clearData without key clears all data and persists', () => {
    setupMocks(createMockPersistedState({ data: { key1: 'value1', key2: 'value2' } }));

    const { result } = renderHook(() => useLearningExperienceContext());

    act(() => {
      result.current.clearData();
    });

    expect(result.current.data).toEqual({});
    expect(mockPersistValue).toHaveBeenCalledWith('data', {});
  });
});

describe('useLearningExperienceContext - memoization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it('context value is memoized between renders when state unchanged', () => {
    const { result, rerender } = renderHook(() => useLearningExperienceContext());

    const firstRenderValue = result.current;
    rerender();

    expect(result.current).toBe(firstRenderValue);
  });

  it('context value updates when state changes', () => {
    const { result } = renderHook(() => useLearningExperienceContext());

    const firstRenderValue = result.current;

    act(() => {
      result.current.openLearningExperience();
    });

    expect(result.current).not.toBe(firstRenderValue);
  });
});
