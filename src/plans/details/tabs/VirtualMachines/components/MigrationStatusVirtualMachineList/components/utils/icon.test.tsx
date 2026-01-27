import type { ReactElement } from 'react';

import type { V1beta1PlanStatusMigrationVmsPipeline } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { Icon } from '@patternfly/react-core';
import { CheckIcon, ResourcesEmptyIcon, TimesIcon } from '@patternfly/react-icons';

import { getPipelineProgressIcon } from './icon';

type IconWithStatusProps = {
  children: ReactElement;
  status: string;
};

describe('getPipelineProgressIcon', () => {
  describe('when pipeline has an error', () => {
    it('returns error icon (X)', () => {
      const pipeline = {
        error: {
          phase: 'Error',
          reasons: ['Connection failed'],
        },
        name: 'DiskTransfer',
        progress: {
          completed: 0,
          total: 10,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline) as ReactElement<IconWithStatusProps>;

      expect(result.type).toBe(Icon);
      expect(result.props.status).toBe('danger');
      expect(result.props.children.type).toBe(TimesIcon);
    });
  });

  describe('when pipeline phase is "Completed"', () => {
    it('returns success icon (checkmark)', () => {
      const pipeline = {
        name: 'DiskTransfer',
        phase: 'Completed',
        progress: {
          completed: 10,
          total: 10,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline) as ReactElement<IconWithStatusProps>;

      expect(result.type).toBe(Icon);
      expect(result.props.status).toBe('success');
      expect(result.props.children.type).toBe(CheckIcon);
    });
  });

  describe('when pipeline phase is undefined but all tasks are completed', () => {
    it('returns success icon (checkmark) - fixes MTV-3585', () => {
      const pipeline = {
        name: 'DiskTransfer',
        phase: undefined,
        progress: {
          completed: 10,
          total: 10,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline) as ReactElement<IconWithStatusProps>;

      expect(result.type).toBe(Icon);
      expect(result.props.status).toBe('success');
      expect(result.props.children.type).toBe(CheckIcon);
    });

    it('returns success icon when completed equals total (warm migration scenario)', () => {
      const pipeline = {
        name: 'DiskTransfer',
        progress: {
          completed: 5,
          total: 5,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline) as ReactElement<IconWithStatusProps>;

      expect(result.type).toBe(Icon);
      expect(result.props.status).toBe('success');
      expect(result.props.children.type).toBe(CheckIcon);
    });
  });

  describe('when pipeline is in progress', () => {
    it('returns pending icon (circle) when progress is incomplete', () => {
      const pipeline = {
        name: 'DiskTransfer',
        phase: undefined,
        progress: {
          completed: 5,
          total: 10,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline);

      expect(result.type).toBe(ResourcesEmptyIcon);
    });

    it('returns pending icon when phase is Pending', () => {
      const pipeline = {
        name: 'DiskTransfer',
        phase: 'Pending',
        progress: {
          completed: 0,
          total: 10,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline);

      expect(result.type).toBe(ResourcesEmptyIcon);
    });
  });

  describe('edge cases', () => {
    it('returns pending icon when progress.completed is undefined', () => {
      const pipeline = {
        name: 'DiskTransfer',
        progress: {
          completed: undefined as unknown as number,
          total: 10,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline);

      expect(result.type).toBe(ResourcesEmptyIcon);
    });

    it('returns pending icon when progress.total is undefined', () => {
      const pipeline = {
        name: 'DiskTransfer',
        progress: {
          completed: 10,
          total: undefined as unknown as number,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline);

      expect(result.type).toBe(ResourcesEmptyIcon);
    });

    it('returns checkmark when completed is 0 and total is 0', () => {
      const pipeline = {
        name: 'DiskTransfer',
        progress: {
          completed: 0,
          total: 0,
        },
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline) as ReactElement<IconWithStatusProps>;

      expect(result.type).toBe(Icon);
      expect(result.props.status).toBe('success');
      expect(result.props.children.type).toBe(CheckIcon);
    });

    it('returns pending icon when progress is missing', () => {
      const pipeline = {
        name: 'DiskTransfer',
        phase: 'Running',
      } as V1beta1PlanStatusMigrationVmsPipeline;

      const result = getPipelineProgressIcon(pipeline);

      expect(result.type).toBe(ResourcesEmptyIcon);
    });
  });
});
