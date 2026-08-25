import type { K8sResourceCommon, V1beta1Plan } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import PlanResumeConversionModal from '../PlanResumeConversionModal';

jest.mock('src/utils/i18n', () => {
  const mockT = (key: string, params?: Record<string, unknown>): string => {
    if (!params) {
      return key;
    }
    return Object.entries(params).reduce(
      (result, [paramName, paramValue]) =>
        result.split(`{{${paramName}}}`).join(paramValue?.toString() ?? ''),
      key,
    );
  };

  return {
    ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
    t: mockT,
    useForkliftTranslation: (): { t: typeof mockT } => ({ t: mockT }),
  };
});

const mockK8sCreate = jest.fn().mockResolvedValue(undefined);
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn((args: { data: K8sResourceCommon }) => mockK8sCreate(args)),
}));

jest.mock('@utils/helpers/getObjectRef', () => ({
  getObjectRef: jest.fn(
    (obj: { apiVersion: string; kind: string; metadata?: Record<string, string> }) => ({
      apiVersion: obj?.apiVersion,
      kind: obj?.kind,
      name: obj?.metadata?.name,
      namespace: obj?.metadata?.namespace,
      uid: obj?.metadata?.uid,
    }),
  ),
}));

const makePlan = (disksCopiedVMs: string[] = ['vm-1']): V1beta1Plan =>
  ({
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: { name: 'test-plan', namespace: 'test-ns', uid: 'plan-uid-123' },
    status: {
      migration: {
        vms: disksCopiedVMs.map((name) => ({
          name,
          disksCopied: true,
        })),
      },
    },
  }) as unknown as V1beta1Plan;

const closeOverlay = jest.fn();

describe('PlanResumeConversionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with the correct title and confirm label', () => {
    render(<PlanResumeConversionModal closeOverlay={closeOverlay} plan={makePlan()} />);

    expect(screen.getByText('Resume conversion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
  });

  it('shows the info alert and safety warning', () => {
    render(<PlanResumeConversionModal closeOverlay={closeOverlay} plan={makePlan()} />);

    expect(screen.getByText('Disk copy will be skipped')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This will re-run only the guest conversion step, reusing the disks that were already copied. The source VM must not have been powered on since the original migration.',
      ),
    ).toBeInTheDocument();
  });

  it('displays the interpolated VM count in the confirmation message', () => {
    render(
      <PlanResumeConversionModal closeOverlay={closeOverlay} plan={makePlan(['vm-1', 'vm-2'])} />,
    );

    expect(
      screen.getByText(
        'Resume conversion for plan test-plan? 2 VM with copied disks will be processed.',
      ),
    ).toBeInTheDocument();
  });

  it('displays the correct count for a single VM', () => {
    render(<PlanResumeConversionModal closeOverlay={closeOverlay} plan={makePlan(['vm-1'])} />);

    expect(
      screen.getByText(
        'Resume conversion for plan test-plan? 1 VM with copied disks will be processed.',
      ),
    ).toBeInTheDocument();
  });

  it('creates a Migration with resumeConversion: true on confirm', async () => {
    const user = userEvent.setup();
    render(<PlanResumeConversionModal closeOverlay={closeOverlay} plan={makePlan()} />);

    const confirmButton = screen.getByRole('button', { name: /resume/i });
    await user.click(confirmButton);

    expect(mockK8sCreate).toHaveBeenCalledTimes(1);
    const [[{ data }]] = mockK8sCreate.mock.calls;

    expect(data.spec.resumeConversion).toBe(true);
    expect(data.spec.plan).toEqual({
      name: 'test-plan',
      namespace: 'test-ns',
      uid: 'plan-uid-123',
    });
  });

  it('sets the correct ownerReference on the Migration', async () => {
    const user = userEvent.setup();
    render(<PlanResumeConversionModal closeOverlay={closeOverlay} plan={makePlan()} />);

    await user.click(screen.getByRole('button', { name: /resume/i }));

    const [[{ data }]] = mockK8sCreate.mock.calls;
    const [ownerRef] = data.metadata.ownerReferences;

    expect(ownerRef.apiVersion).toBe('forklift.konveyor.io/v1beta1');
    expect(ownerRef.kind).toBe('Plan');
    expect(ownerRef.name).toBe('test-plan');
    expect(ownerRef.uid).toBe('plan-uid-123');
  });

  it('sets generateName with plan name prefix', async () => {
    const user = userEvent.setup();
    render(<PlanResumeConversionModal closeOverlay={closeOverlay} plan={makePlan()} />);

    await user.click(screen.getByRole('button', { name: /resume/i }));

    const [[{ data }]] = mockK8sCreate.mock.calls;
    expect(data.metadata.generateName).toBe('test-plan-resume-');
    expect(data.metadata.namespace).toBe('test-ns');
  });

  it('filters only VMs with disksCopied === true', () => {
    const plan = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'Plan',
      metadata: { name: 'mixed-plan', namespace: 'test-ns', uid: 'plan-uid-123' },
      status: {
        migration: {
          vms: [
            { name: 'vm-copied', disksCopied: true },
            { name: 'vm-not-copied', disksCopied: false },
            { name: 'vm-no-field' },
          ],
        },
      },
    } as unknown as V1beta1Plan;

    render(<PlanResumeConversionModal closeOverlay={closeOverlay} plan={plan} />);

    expect(
      screen.getByText(
        'Resume conversion for plan mixed-plan? 1 VM with copied disks will be processed.',
      ),
    ).toBeInTheDocument();
  });
});
