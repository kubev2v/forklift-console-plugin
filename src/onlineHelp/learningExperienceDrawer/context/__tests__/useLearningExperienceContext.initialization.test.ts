import { renderHook } from '@testing-library/react-hooks';

import { DEFAULT_DATA, DEFAULT_DRAWER_WIDTH } from '../../utils/constants';
import { useLearningExperienceContext } from '../useLearningExperienceContext';

import {
  testDrawerWidth,
  testItemId,
  testItemId2,
  testReferenceId,
  testScrollPosition,
  testStoredReferencePosition,
  testTopicId,
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
    const storedItems = [testItemId, testItemId2];
    setupMocks(createMockPersistedState({ openExpansionItems: storedItems }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.openExpansionItems).toEqual(storedItems);
  });

  it('restores scrollPosition from storage', () => {
    setupMocks(createMockPersistedState({ scrollPosition: testScrollPosition }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.scrollPosition).toBe(testScrollPosition);
  });

  it('restores drawerWidth from storage', () => {
    setupMocks(createMockPersistedState({ drawerWidth: testDrawerWidth }));

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(result.current.drawerWidth).toBe(testDrawerWidth);
  });

  it('restores referenceScrollPositions from storage', () => {
    const referencePositions = { [testReferenceId]: testStoredReferencePosition };
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
    const mockTopic = createMockTopic(testTopicId);
    setupMocks(createMockPersistedState({ selectedTopicId: testTopicId }), mockTopic);

    const { result } = renderHook(() => useLearningExperienceContext());

    expect(mockFindTopicById).toHaveBeenCalledWith(testTopicId);
    expect(result.current.selectedTopic).toBe(mockTopic);
  });
});
