import { TELEMETRY_EVENTS } from '@utils/analytics/constants';

import { submitMigrationPlan } from '../submitMigrationPlan';

import {
  baseFormData,
  mockNetworkMap,
  mockPlanRef,
  mockStorageMap,
} from './submitMigrationPlan.fixtures';

const mockBuildRequests = jest.fn();
const mockCreatePlan = jest.fn();
const mockAddOwnerRefs = jest.fn();

jest.mock('../buildMigrationPlanResourceRequests', (): unknown => ({
  buildMigrationPlanResourceRequests: (...args: unknown[]) => mockBuildRequests(...args),
}));
jest.mock('../createPlan', (): unknown => ({
  createPlan: (...args: unknown[]) => mockCreatePlan(...args),
}));
jest.mock('../addPlanResourceOwnerRefs', (): unknown => ({
  addPlanResourceOwnerRefs: (...args: unknown[]) => mockAddOwnerRefs(...args),
}));

describe('submitMigrationPlan - rejection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildRequests.mockReturnValue([
      Promise.resolve(mockNetworkMap),
      Promise.resolve(mockStorageMap),
      Promise.resolve({ secret: undefined }),
      Promise.resolve({}),
      Promise.resolve(undefined),
    ]);
    mockCreatePlan.mockResolvedValue(mockPlanRef);
    mockAddOwnerRefs.mockResolvedValue(undefined);
  });

  it('rejects when createPlan fails and skips completed telemetry', async () => {
    const trackEvent = jest.fn();
    mockCreatePlan.mockRejectedValue(new Error('create plan failed'));

    await expect(submitMigrationPlan(baseFormData, trackEvent)).rejects.toThrow(
      'create plan failed',
    );
    expect(mockAddOwnerRefs).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalledWith(
      TELEMETRY_EVENTS.PLAN_CREATE_COMPLETED,
      expect.anything(),
    );
  });

  it('rejects when addPlanResourceOwnerRefs fails and skips completed telemetry', async () => {
    const trackEvent = jest.fn();
    mockAddOwnerRefs.mockRejectedValue(new Error('owner refs failed'));

    await expect(submitMigrationPlan(baseFormData, trackEvent)).rejects.toThrow(
      'owner refs failed',
    );
    expect(trackEvent).not.toHaveBeenCalledWith(
      TELEMETRY_EVENTS.PLAN_CREATE_COMPLETED,
      expect.anything(),
    );
  });
});
