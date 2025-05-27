import type {
  IoK8sApiBatchV1Job,
  V1beta1PlanStatusMigrationVmsPipeline,
  V1beta1PlanStatusMigrationVmsPipelineTasks,
  V1beta1PlanStatusMigrationVmsPipelineTasksProgress,
} from '@kubev2v/types';
import { CONDITION_STATUS, EMPTY_MSG, taskStatuses } from '@utils/constants';

import type { DiskTransferMap, TaskCounterMap } from './types';

const hasPipelineNotFailed = (pipeline: V1beta1PlanStatusMigrationVmsPipeline) => !pipeline?.error;

const hasPipelineCompleted = (pipeline: V1beta1PlanStatusMigrationVmsPipeline) =>
  hasPipelineNotFailed(pipeline) && pipeline?.phase === taskStatuses.completed;

const hasPipelineOkAndTaskProgressCompleted = (
  taskProgress: V1beta1PlanStatusMigrationVmsPipelineTasksProgress,
  pipeline: V1beta1PlanStatusMigrationVmsPipeline,
) => hasPipelineNotFailed(pipeline) && taskProgress.completed === taskProgress.total;

const hasTaskCompleted = (
  taskPhase: string | undefined,
  taskProgress: V1beta1PlanStatusMigrationVmsPipelineTasksProgress,
  pipeline: V1beta1PlanStatusMigrationVmsPipeline,
) =>
  taskPhase === taskStatuses.completed ||
  (taskPhase === undefined && hasPipelineCompleted(pipeline)) ||
  (taskPhase === undefined && hasPipelineOkAndTaskProgressCompleted(taskProgress, pipeline));

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
      condition.type === taskStatuses.failed && condition.status === CONDITION_STATUS.TRUE,
  );
  const conditionComplete = conditions.find(
    (condition) =>
      condition.type === taskStatuses.completed && condition.status === CONDITION_STATUS.TRUE,
  );

  if (conditionFailed) {
    return taskStatuses.error;
  }

  if (conditionComplete) {
    return taskStatuses.completed;
  }

  return taskStatuses.pending;
};
