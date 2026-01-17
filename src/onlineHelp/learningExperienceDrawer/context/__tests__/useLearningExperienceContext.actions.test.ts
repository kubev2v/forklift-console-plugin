import { act, renderHook } from '@testing-library/react-hooks';

import { useLearningExperienceContext } from '../useLearningExperienceContext';

import {
  TEST_DRAWER_WIDTH,
  TEST_EXISTING_TOPIC_ID,
  TEST_ITEM_ID,
  TEST_ITEM_ID_2,
  TEST_REFERENCE_ID,
  TEST_REFERENCE_SCROLL_POSITION,
  TEST_SCROLL_POSITION,
  TEST_TOPIC_ID,
  TEST_TOPIC_TO_PERSIST_ID,
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
        result.current.setDrawerWidth(TEST_DRAWER_WIDTH);
      });

      expect(result.current.drawerWidth).toBe(TEST_DRAWER_WIDTH);
      expect(mockPersistValue).toHaveBeenCalledWith('drawerWidth', TEST_DRAWER_WIDTH);
    });
  });

  describe('Scroll Positions', () => {
    it('setScrollPosition updates state and persists value', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setScrollPosition(TEST_SCROLL_POSITION);
      });

      expect(result.current.scrollPosition).toBe(TEST_SCROLL_POSITION);
      expect(mockPersistValue).toHaveBeenCalledWith('scrollPosition', TEST_SCROLL_POSITION);
    });

    it('setReferenceScrollPosition updates state and persists value', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setReferenceScrollPosition(
          TEST_REFERENCE_ID,
          TEST_REFERENCE_SCROLL_POSITION,
        );
      });

      expect(result.current.referenceScrollPositions[TEST_REFERENCE_ID]).toBe(
        TEST_REFERENCE_SCROLL_POSITION,
      );
      expect(mockPersistValue).toHaveBeenCalledWith('referenceScrollPositions', {
        [TEST_REFERENCE_ID]: TEST_REFERENCE_SCROLL_POSITION,
      });
    });
  });

  describe('Expansion Items', () => {
    it('openExpansionItem adds item and persists', () => {
      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.openExpansionItem(TEST_ITEM_ID);
      });

      expect(result.current.openExpansionItems).toContain(TEST_ITEM_ID);
      expect(mockPersistValue).toHaveBeenCalledWith('openExpansionItems', [TEST_ITEM_ID]);
    });

    it('openExpansionItem does not duplicate existing item', () => {
      setupMocks(createMockPersistedState({ openExpansionItems: [TEST_ITEM_ID] }));

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.openExpansionItem(TEST_ITEM_ID);
      });

      expect(result.current.openExpansionItems.filter((id) => id === TEST_ITEM_ID)).toHaveLength(1);
    });

    it('closeExpansionItem removes item and persists', () => {
      setupMocks(createMockPersistedState({ openExpansionItems: [TEST_ITEM_ID, TEST_ITEM_ID_2] }));

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.closeExpansionItem(TEST_ITEM_ID);
      });

      expect(result.current.openExpansionItems).not.toContain(TEST_ITEM_ID);
      expect(result.current.openExpansionItems).toContain(TEST_ITEM_ID_2);
      expect(mockPersistValue).toHaveBeenCalledWith('openExpansionItems', [TEST_ITEM_ID_2]);
    });

    it('closeExpansionItem handles non-existent item gracefully', () => {
      setupMocks(createMockPersistedState({ openExpansionItems: [TEST_ITEM_ID] }));

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.closeExpansionItem('non-existent-id');
      });

      expect(result.current.openExpansionItems).toEqual([TEST_ITEM_ID]);
    });
  });

  describe('Topic Selection', () => {
    it('setSelectedTopic sets topic and persists id', () => {
      const mockTopic = createMockTopic(TEST_TOPIC_ID);

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setSelectedTopic(mockTopic);
      });

      expect(result.current.selectedTopic).toBe(mockTopic);
      expect(mockPersistValue).toHaveBeenCalledWith('selectedTopicId', TEST_TOPIC_ID);
    });

    it('setSelectedTopic with null clears topic and persists null', () => {
      const mockTopic = createMockTopic(TEST_EXISTING_TOPIC_ID);
      setupMocks(createMockPersistedState({ selectedTopicId: TEST_EXISTING_TOPIC_ID }), mockTopic);

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setSelectedTopic(null);
      });

      expect(result.current.selectedTopic).toBeNull();
      expect(mockPersistValue).toHaveBeenCalledWith('selectedTopicId', null);
    });

    it('setSelectedTopic persists only topic id', () => {
      const mockTopic = createMockTopic(TEST_TOPIC_TO_PERSIST_ID);

      const { result } = renderHook(() => useLearningExperienceContext());

      act(() => {
        result.current.setSelectedTopic(mockTopic);
      });

      expect(mockPersistValue).toHaveBeenCalledWith('selectedTopicId', TEST_TOPIC_TO_PERSIST_ID);
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
