import { TELEMETRY_EVENTS } from '@utils/analytics/constants';

import { submitMigrationPlan } from '../submitMigrationPlan';

import {
  aapHooksFormData,
  baseFormData,
  localHooksFormData,
  mockCreatedHooks,
  mockNetworkMap,
  mockPlanRef,
  mockStorageMap,
} from './submitMigrationPlan.fixtures';

const mockBuildRequests = jest.fn();
const mockCreatePlan = jest.fn();
const mockAddOwnerRefs = jest.fn();

jest.mock('../buildMigrationPlanResourceRequests', () => ({
  buildMigrationPlanResourceRequests: (...args: unknown[]) => mockBuildRequests(...args),
}));
jest.mock('../createPlan', () => ({
  createPlan: (...args: unknown[]) => mockCreatePlan(...args),
}));
jest.mock('../addPlanResourceOwnerRefs', () => ({
  addPlanResourceOwnerRefs: (...args: unknown[]) => mockAddOwnerRefs(...args),
}));

describe('submitMigrationPlan - orchestration', () => {
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

  it('creates plan, owner refs, and telemetry without hooks', async () => {
    const trackEvent = jest.fn();

    await submitMigrationPlan(baseFormData, trackEvent);

    expect(mockBuildRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: baseFormData,
        hasAapHooks: false,
        hasLocalHooks: false,
      }),
    );
    expect(mockCreatePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        networkMap: mockNetworkMap,
        planName: 'plan-a',
        storageMap: mockStorageMap,
        targetPowerState: 'on',
        vms: [{ id: 'vm-1', name: 'vm-one' }],
      }),
    );
    expect(mockAddOwnerRefs).toHaveBeenCalledWith(
      expect.objectContaining({ networkMap: mockNetworkMap, storageMap: mockStorageMap }),
      mockPlanRef,
    );
    expect(trackEvent).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.PLAN_CREATE_COMPLETED,
      expect.objectContaining({ hasHooks: false, planNamespace: 'plan-ns', vmCount: 1 }),
    );
  });

  it('flags local hooks when hook source is local and enabled', async () => {
    mockBuildRequests.mockReturnValue([
      Promise.resolve(mockNetworkMap),
      Promise.resolve(mockStorageMap),
      Promise.resolve({ secret: { metadata: { name: 'luks' } } }),
      Promise.resolve(mockCreatedHooks),
      Promise.resolve(undefined),
    ]);

    await submitMigrationPlan(localHooksFormData);

    expect(mockBuildRequests).toHaveBeenCalledWith(
      expect.objectContaining({ hasAapHooks: false, hasLocalHooks: true }),
    );
    expect(mockCreatePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        luks: { name: 'luks' },
        postHook: mockCreatedHooks.postHook,
        preHook: mockCreatedHooks.preHook,
      }),
    );
  });

  it('flags AAP hooks when job template ids are set', async () => {
    const trackEvent = jest.fn();
    mockBuildRequests.mockReturnValue([
      Promise.resolve(mockNetworkMap),
      Promise.resolve(mockStorageMap),
      Promise.resolve({ secret: undefined }),
      Promise.resolve(mockCreatedHooks),
      Promise.resolve(undefined),
    ]);

    await submitMigrationPlan(aapHooksFormData, trackEvent);

    expect(mockBuildRequests).toHaveBeenCalledWith(
      expect.objectContaining({ hasAapHooks: true, hasLocalHooks: false }),
    );
    expect(trackEvent).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.PLAN_CREATE_COMPLETED,
      expect.objectContaining({ hasHooks: true, hookSource: 'aap' }),
    );
  });
});
