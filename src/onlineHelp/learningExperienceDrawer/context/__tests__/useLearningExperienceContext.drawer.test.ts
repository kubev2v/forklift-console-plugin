import { act, renderHook } from '@testing-library/react';

import { useLearningExperienceContext } from '../useLearningExperienceContext';

import {
  testDrawerWidth,
  testExistingTopicId,
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

describe('useLearningExperienceContext - drawer actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

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

  it('setDrawerWidth updates state and persists value', () => {
    const { result } = renderHook(() => useLearningExperienceContext());

    act(() => {
      result.current.setDrawerWidth(testDrawerWidth);
    });

    expect(result.current.drawerWidth).toBe(testDrawerWidth);
    expect(mockPersistValue).toHaveBeenCalledWith('drawerWidth', testDrawerWidth);
  });

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

describe('useLearningExperienceContext - topic selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks({});
  });

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
