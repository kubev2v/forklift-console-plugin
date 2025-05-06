import { hasTaskCompleted } from 'src/modules/Plans/views/details/utils/hasTaskCompleted';

import type {
  IoK8sApiBatchV1Job,
  V1beta1PlanStatusMigrationVmsPipeline,
  V1beta1PlanStatusMigrationVmsPipelineTasks,
} from '@kubev2v/types';
import { conditionBoolean, EMPTY_MSG, taskStatuses } from '@utils/constants';

import type { DiskTransferMap, TaskCounterMap } from './types';

export const countTasks = (
  diskTransferPipeline: V1beta1PlanStatusMigrationVmsPipeline | undefined,
): TaskCounterMap => {
  if (!diskTransferPipeline || !Array.isArray(diskTransferPipeline?.tasks)) {
    return { completedTasks: 0, totalTasks: 0 };
  }

  const totalTasks = diskTransferPipeline.tasks.length;

  // search num of completed tasks (either tasks that completed successfully or ones that aren't finished but their pipeline step is).
  const completedTasks = diskTransferPipeline.tasks.filter((task) =>
    hasTaskCompleted(task.phase, task.progress, diskTransferPipeline),
  ).length;

  return { completedTasks, totalTasks };
};

export const getTransferProgress = (
  diskTransferPipeline: V1beta1PlanStatusMigrationVmsPipeline | undefined,
): DiskTransferMap => {
  if (!diskTransferPipeline?.progress) {
    return { completed: EMPTY_MSG, total: EMPTY_MSG };
  }

  const { completed, total } = diskTransferPipeline.progress;
  return {
    completed: completed ?? EMPTY_MSG,
    total: total ?? EMPTY_MSG,
  };
};

export const getTaskProgress = (task: V1beta1PlanStatusMigrationVmsPipelineTasks): string => {
  if (!task?.progress) {
    return `${EMPTY_MSG} / ${EMPTY_MSG}`;
  }

  const { completed, total } = task.progress;

  const completeString = completed ?? EMPTY_MSG;
  const totalString = total ?? EMPTY_MSG;

  return `${completeString} / ${totalString} ${task.annotations?.unit ?? EMPTY_MSG}`;
};

export const getPipelineTasks = (pipeline: V1beta1PlanStatusMigrationVmsPipeline) => {
  const tasks = pipeline?.tasks ?? [];

  // search for all completed tasks (either tasks that completed successfully or ones that aren't finished but their pipeline step is).
  const tasksCompleted = tasks.filter((task) =>
    hasTaskCompleted(task.phase, task.progress, pipeline),
  );

  return { completed: tasksCompleted.length, name: pipeline.name, total: tasks.length };
};

export const getJobPhase = (job: IoK8sApiBatchV1Job) => {
  const conditions = job?.status?.conditions ?? [];

  const conditionFailed = conditions.find(
    (condition) =>
      condition.type === taskStatuses.failed && condition.status === conditionBoolean.true,
  );
  const conditionComplete = conditions.find(
    (condition) =>
      condition.type === taskStatuses.completed && condition.status === conditionBoolean.true,
  );

  if (conditionFailed) {
    return taskStatuses.error;
  }

  if (conditionComplete) {
    return taskStatuses.completed;
  }

  return taskStatuses.pending;
};
