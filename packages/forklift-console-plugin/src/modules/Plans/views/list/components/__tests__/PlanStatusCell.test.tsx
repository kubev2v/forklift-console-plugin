/* eslint-disable @cspell/spellchecker */
import React from 'react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { mockFailedVm, mockMigration, mockPlanData, mockSucceededVm } from 'src/__mocks__/plans';
import * as usePlanMigration from 'src/modules/Plans/hooks/usePlanMigration';
import {
  PlanConditionCategory,
  PlanConditionReason,
  PlanConditionStatus,
  PlanConditionType,
} from 'src/modules/Plans/utils/types/PlanCondition';
import { ModalHOC } from 'src/modules/Providers';

import { V1beta1PlanSpec, V1beta1PlanStatusConditions } from '@kubev2v/types';
import { render, screen, within } from '@testing-library/react';

import '@testing-library/jest-dom';

import { PlanStatusCell } from '../PlanStatusCell';

const history = createMemoryHistory();

const renderPlanStatusCell = ({
  conditions,
  spec,
}: {
  conditions?: V1beta1PlanStatusConditions[];
  spec?: Partial<V1beta1PlanSpec>;
}) =>
  render(
    <Router history={history}>
      <ModalHOC>
        <PlanStatusCell
          data={{
            obj: {
              ...mockPlanData.obj,
              spec: {
                ...mockPlanData.obj.spec,
                ...spec,
              },
              status: {
                conditions,
              },
            },
          }}
          fieldId="test"
          fields={[]}
        />
      </ModalHOC>
    </Router>,
  );

describe('PlanStatusCell', () => {
  const usePlanMigrationSpy = jest.spyOn(usePlanMigration, 'usePlanMigration');

  it('Shows "Archived" summary status label', () => {
    usePlanMigrationSpy.mockReturnValue([mockMigration, true, false]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Advisory,
          type: PlanConditionType.Archived,
          status: PlanConditionStatus.True,
          lastTransitionTime: '2025-01-14T15:29:38Z',
        },
        {
          category: PlanConditionCategory.Advisory,
          type: PlanConditionType.Executing,
          status: PlanConditionStatus.True,
          lastTransitionTime: '2025-01-13T15:29:38Z',
        },
      ],
    });

    expect(screen.getByText('Archived')).toBeVisible();
  });

  it('Shows "Canceled" summary status label when all VMs are Canceled', () => {
    usePlanMigrationSpy.mockReturnValue([mockMigration, true, false]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Advisory,
          type: PlanConditionType.Canceled,
          status: PlanConditionStatus.True,
          lastTransitionTime: '2025-01-14T15:29:38Z',
        },
      ],
    });

    expect(screen.getByText('Canceled')).toBeVisible();
  });

  it('Shows "Cannot start" summary status label', () => {
    usePlanMigrationSpy.mockReturnValue([mockMigration, true, false]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Critical,
          type: PlanConditionType.VMMultiplePodNetworkMappings,
          items: [" id:19cf9fbb-1823-4499-ac15-1b053cf85c89 name:'winweb02' "],
          lastTransitionTime: '2025-01-20T19:40:38Z',
          message: 'VM has more than one interface mapped to the pod network.',
          reason: PlanConditionReason.NotValid,
          status: PlanConditionStatus.True,
        },
      ],
    });

    expect(screen.getByText('Cannot start')).toBeVisible();
  });

  it('Shows "Complete" summary status label with VM count', () => {
    usePlanMigrationSpy.mockReturnValue([
      {
        ...mockMigration,
        status: {
          vms: [mockSucceededVm],
        },
      },
      true,
      false,
    ]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Advisory,
          type: PlanConditionType.Succeeded,
          status: PlanConditionStatus.True,
          lastTransitionTime: '2025-01-20T19:40:38Z',
        },
      ],
    });

    expect(screen.getByText('Complete')).toBeVisible();

    const successVmCount = screen.getByTestId('plan-status-vm-count-success');
    expect(within(successVmCount).getByText('1 VM')).toBeVisible();
  });

  it('Shows "Incomplete" summary status label with VM counts', () => {
    usePlanMigrationSpy.mockReturnValue([
      {
        ...mockMigration,
        status: {
          vms: [mockFailedVm, mockSucceededVm],
        },
      },
      true,
      false,
    ]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Advisory,
          lastTransitionTime: '2025-01-14T08:46:06Z',
          message: 'The plan execution has FAILED.',
          status: PlanConditionStatus.True,
          type: PlanConditionType.Failed,
        },
      ],
    });

    expect(screen.getByText('Incomplete')).toBeVisible();
    const errorVmCount = screen.getByTestId('plan-status-vm-count-danger');
    const successVmCount = screen.getByTestId('plan-status-vm-count-success');

    expect(within(errorVmCount).getByText('1 VM')).toBeVisible();
    expect(within(successVmCount).getByText('1 VM')).toBeVisible();
  });

  it('Shows "Start" button when the latest condition type is "Ready"', () => {
    usePlanMigrationSpy.mockReturnValue([mockMigration, true, false]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Required,
          lastTransitionTime: '2025-01-20T19:40:38Z',
          message: 'The migration plan is ready.',
          status: PlanConditionStatus.True,
          type: PlanConditionType.Ready,
        },
      ],
    });

    expect(screen.getByRole('button', { name: 'Start' })).toBeVisible();
  });

  it('Shows "Validating..." while latest condition type is "Not Ready"', () => {
    usePlanMigrationSpy.mockReturnValue([mockMigration, true, false]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Required,
          type: PlanConditionType.NotReady,
          status: PlanConditionStatus.True,
          lastTransitionTime: '2025-01-20T19:40:38Z',
        },
      ],
    });
    expect(screen.getByText('Validating...')).toBeVisible();
  });

  it('Shows status spinner with percentage while "Executing" with cold migration', () => {
    usePlanMigrationSpy.mockReturnValue([mockMigration, true, false]);

    renderPlanStatusCell({
      conditions: [
        {
          category: PlanConditionCategory.Advisory,
          type: PlanConditionType.Executing,
          status: PlanConditionStatus.True,
          lastTransitionTime: '2025-01-20T19:40:38Z',
        },
      ],
      spec: { warm: false },
    });

    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByText('33%')).toBeVisible();
  });
});
