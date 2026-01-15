import { act, renderHook } from '@testing-library/react-hooks';

import { useLearningExperienceContext } from '../useLearningExperienceContext';

import {
  testDrawerWidth,
  testExistingTopicId,
  testItemId,
  testItemId2,
  testReferenceId,
  testReferenceScrollPosition,
  testScrollPosition,
  testTopicId,
  testTopicToPersistId,
} from './constants';
import { createMockPersistedState, createMockTopic, mockPersistValue, setupMocks } from './utils';

jest.mock('../../utils/utils', () => ({
  findTopicById: jest.fn(),
  persistValue: jest.fn(),
}));

jest.mock('@utils/userSettingsHelpers', () => ({
  parseOrClean: jest.fn(),
}));

describe('useLearningExperienceContext - Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  describe('Drawer Open/Close', () => {
    it('openLearningExperience sets state to true and persists', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.openLearningExperience();
      });

      expect(result.current.isLearningExperienceOpen).toBe(true);
      expect(mockPersistValue).toHaveBeenCalledWith('isLearningExperienceOpen', true);
    });

    it('closeLearningExperience sets state to false and persists', () => {
      setupMocks(createMockPersistedState({ isLearningExperienceOpen: true }));

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.closeLearningExperience();
      });

      expect(result.current.isLearningExperienceOpen).toBe(false);
      expect(mockPersistValue).toHaveBeenCalledWith('isLearningExperienceOpen', false);
    });
  });

  describe('Drawer Width', () => {
    it('setDrawerWidth updates state and persists value', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setDrawerWidth(testDrawerWidth);
      });

      expect(result.current.drawerWidth).toBe(testDrawerWidth);
      expect(mockPersistValue).toHaveBeenCalledWith('drawerWidth', testDrawerWidth);
    });
  });

  describe('Scroll Positions', () => {
    it('setScrollPosition updates state and persists value', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setScrollPosition(testScrollPosition);
      });

      expect(result.current.scrollPosition).toBe(testScrollPosition);
      expect(mockPersistValue).toHaveBeenCalledWith('scrollPosition', testScrollPosition);
    });

    it('setReferenceScrollPosition updates state and persists value', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setReferenceScrollPosition(testReferenceId, testReferenceScrollPosition);
      });

      expect(result.current.referenceScrollPositions[testReferenceId]).toBe(
        testReferenceScrollPosition,
      );
      expect(mockPersistValue).toHaveBeenCalledWith('referenceScrollPositions', {
        [testReferenceId]: testReferenceScrollPosition,
      });
    });
  });

  describe('Expansion Items', () => {
    it('openExpansionItem adds item and persists', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.openExpansionItem(testItemId);
      });

      expect(result.current.openExpansionItems).toContain(testItemId);
      expect(mockPersistValue).toHaveBeenCalledWith('openExpansionItems', [testItemId]);
    });

    it('openExpansionItem does not duplicate existing item', () => {
      setupMocks(createMockPersistedState({ openExpansionItems: [testItemId] }));

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.openExpansionItem(testItemId);
      });

      expect(result.current.openExpansionItems.filter((id) => id === testItemId)).toHaveLength(1);
    });

    it('closeExpansionItem removes item and persists', () => {
      setupMocks(createMockPersistedState({ openExpansionItems: [testItemId, testItemId2] }));

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.closeExpansionItem(testItemId);
      });

      expect(result.current.openExpansionItems).not.toContain(testItemId);
      expect(result.current.openExpansionItems).toContain(testItemId2);
      expect(mockPersistValue).toHaveBeenCalledWith('openExpansionItems', [testItemId2]);
    });

    it('closeExpansionItem handles non-existent item gracefully', () => {
      setupMocks(createMockPersistedState({ openExpansionItems: [testItemId] }));

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.closeExpansionItem('non-existent-id');
      });

      expect(result.current.openExpansionItems).toEqual([testItemId]);
    });
  });

  describe('Topic Selection', () => {
    it('setSelectedTopic sets topic and persists id', () => {
      const mockTopic = createMockTopic(testTopicId);

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setSelectedTopic(mockTopic);
      });

      expect(result.current.selectedTopic).toBe(mockTopic);
      expect(mockPersistValue).toHaveBeenCalledWith('selectedTopicId', testTopicId);
    });

    it('setSelectedTopic with null clears topic and persists null', () => {
      const mockTopic = createMockTopic(testExistingTopicId);
      setupMocks(createMockPersistedState({ selectedTopicId: testExistingTopicId }), mockTopic);

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setSelectedTopic(null);
      });

      expect(result.current.selectedTopic).toBeNull();
      expect(mockPersistValue).toHaveBeenCalledWith('selectedTopicId', null);
    });

    it('setSelectedTopic persists only topic id', () => {
      const mockTopic = createMockTopic(testTopicToPersistId);

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setSelectedTopic(mockTopic);
      });

      expect(mockPersistValue).toHaveBeenCalledWith('selectedTopicId', testTopicToPersistId);
    });
  });

  describe('Data Management', () => {
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

  describe('Memoization', () => {
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
});
