import { renderHook } from '@testing-library/react-hooks';

import { DEFAULT_DATA, DEFAULT_DRAWER_WIDTH } from '../../utils/constants';
import { useLearningExperienceContext } from '../useLearningExperienceContext';

import {
  TEST_DRAWER_WIDTH,
  TEST_ITEM_ID,
  TEST_ITEM_ID_2,
  TEST_REFERENCE_ID,
  TEST_SCROLL_POSITION,
  TEST_STORED_REFERENCE_POSITION,
  TEST_TOPIC_ID,
} from './constants';
import { createMockPersistedState, createMockTopic, mockFindTopicById, setupMocks } from './utils';

jest.mock('../../utils/utils', () => ({
  findTopicById: jest.fn(),
  persistValue: jest.fn(),
}));

jest.mock('@utils/userSettingsHelpers', () => ({
  parseOrClean: jest.fn(),
}));

describe('useLearningExperienceContext - Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

  it('returns default state when localStorage is empty', () => {
    setupMocks({});

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.isLearningExperienceOpen).toBe(false);
    expect(result.current.openExpansionItems).toEqual([]);
    expect(result.current.scrollPosition).toBe(0);
    expect(result.current.referenceScrollPositions).toEqual({});
    expect(result.current.selectedTopic).toBeNull();
    expect(result.current.drawerWidth).toBe(DEFAULT_DRAWER_WIDTH);
    expect(result.current.data).toEqual(DEFAULT_DATA);
  });

  it('restores isLearningExperienceOpen from storage', () => {
    setupMocks(createMockPersistedState({ isLearningExperienceOpen: true }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.isLearningExperienceOpen).toBe(true);
  });

  it('restores openExpansionItems from storage', () => {
    const storedItems = [TEST_ITEM_ID, TEST_ITEM_ID_2];
    setupMocks(createMockPersistedState({ openExpansionItems: storedItems }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.openExpansionItems).toEqual(storedItems);
  });

  it('restores scrollPosition from storage', () => {
    setupMocks(createMockPersistedState({ scrollPosition: TEST_SCROLL_POSITION }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.scrollPosition).toBe(TEST_SCROLL_POSITION);
  });

  it('restores drawerWidth from storage', () => {
    setupMocks(createMockPersistedState({ drawerWidth: TEST_DRAWER_WIDTH }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.drawerWidth).toBe(TEST_DRAWER_WIDTH);
  });

  it('restores referenceScrollPositions from storage', () => {
    const referencePositions = { [TEST_REFERENCE_ID]: TEST_STORED_REFERENCE_POSITION };
    setupMocks(createMockPersistedState({ referenceScrollPositions: referencePositions }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.referenceScrollPositions).toEqual(referencePositions);
  });

  it('restores data from storage', () => {
    const customData = { customKey: 'customValue' };
    setupMocks(createMockPersistedState({ data: customData }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.data).toEqual(customData);
  });

  it('restores selectedTopic using findTopicById', () => {
    const mockTopic = createMockTopic(TEST_TOPIC_ID);
    setupMocks(createMockPersistedState({ selectedTopicId: TEST_TOPIC_ID }), mockTopic);

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(mockFindTopicById).toHaveBeenCalledWith(TEST_TOPIC_ID);
    expect(result.current.selectedTopic).toBe(mockTopic);
  });
});
