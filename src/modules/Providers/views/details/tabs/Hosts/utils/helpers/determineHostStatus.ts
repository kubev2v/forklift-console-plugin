import type { V1beta1Host } from '@kubev2v/types';

type StatusResult = {
  status: string;
  message: string;
};

/**
 * @description Determine the current status of a host.
 * @param {V1beta1Host} host - The host object to evaluate.
 * @return {StatusResult} An object with the current status and the associated message.
 */
export function determineHostStatus(host: V1beta1Host): StatusResult {
  const errorTypes = [
    'ConnectionTestFailed',
    'NotHealthy',
    'RefNotValid',
    'SecretNotValid',
    'TypeNotValid',
    'IpNotValid',
    'InMaintenance',
  ];

  const runningTypes = ['ConnectionTestSucceeded', 'Validated'];

  if (!host?.status?.conditions) {
    return { message: '', status: 'unknown' };
  }

  for (const condition of host.status.conditions) {
    if (condition.type === 'Ready' && condition.status === 'True') {
      return { message: condition.message, status: 'Ready' };
    }
  }

  for (const condition of host.status.conditions) {
    if (condition.status === 'True') {
      if (errorTypes.includes(condition.type)) {
        return { message: condition.message, status: 'Error' };
      }
    }
  }

  for (const condition of host.status.conditions) {
    if (condition.status === 'True') {
      if (runningTypes.includes(condition.type)) {
        return { message: condition.message, status: 'Running' };
      }
    }
  }

  return { message: '', status: 'unknown' };
}
