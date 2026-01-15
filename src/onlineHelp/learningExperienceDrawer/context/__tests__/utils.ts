import type { LearningExperienceTopic } from 'src/onlineHelp/utils/types';

import { parseOrClean } from '@utils/userSettingsHelpers';

import { DEFAULT_DATA, DEFAULT_DRAWER_WIDTH } from '../../utils/constants';
import type { PersistedState } from '../../utils/types';
import { findTopicById, persistValue } from '../../utils/utils';

const mockParseOrClean = parseOrClean as jest.MockedFunction<typeof parseOrClean>;
export const mockFindTopicById = findTopicById as jest.MockedFunction<typeof findTopicById>;
export const mockPersistValue = persistValue as jest.MockedFunction<typeof persistValue>;

export const createMockPersistedState = (
  overrides: Partial<PersistedState> = {},
): PersistedState => ({
  isLearningExperienceOpen: false,
  openExpansionItems: [],
  scrollPosition: 0,
  referenceScrollPositions: {},
  selectedTopicId: null,
  drawerWidth: DEFAULT_DRAWER_WIDTH,
  data: DEFAULT_DATA,
  ...overrides,
});

export const createMockTopic = (id: string): LearningExperienceTopic =>
  ({
    id,
    title: `Test Topic ${id}`,
    description: `Description for ${id}`,
    icon: jest.fn(),
    subTopics: jest.fn(() => []),
    trackingEventTopic: `test-${id}`,
  }) as unknown as LearningExperienceTopic;

export const setupMocks = (
  persistedState: PersistedState = {},
  topicToReturn: LearningExperienceTopic | null = null,
) => {
  mockParseOrClean.mockReturnValue(persistedState);
  mockFindTopicById.mockReturnValue(topicToReturn);
};
