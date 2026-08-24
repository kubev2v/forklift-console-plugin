export const mockUseK8sWatchResource = jest.fn();

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: (...args: unknown[]): ReturnType<typeof mockUseK8sWatchResource> =>
    mockUseK8sWatchResource(...args),
}));

export const mockIsPlanEditable = jest.fn();
export const mockGetPlanStatus = jest.fn();

jest.mock('src/plans/details/components/PlanStatus/utils/utils', () => ({
  getPlanStatus: (...args: unknown[]): ReturnType<typeof mockGetPlanStatus> =>
    mockGetPlanStatus(...args),
  isPlanEditable: (...args: unknown[]): ReturnType<typeof mockIsPlanEditable> =>
    mockIsPlanEditable(...args),
}));
