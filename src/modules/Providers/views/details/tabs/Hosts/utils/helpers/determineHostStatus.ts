import { V1beta1Host } from '@kubev2v/types';

interface StatusResult {
  status: string;
  message: string;
}

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
    return { status: 'unknown', message: '' };
  }

  for (const condition of host.status.conditions) {
    if (condition.type === 'Ready' && condition.status === 'True') {
      return { status: 'Ready', message: condition.message };
    }
  }

  for (const condition of host.status.conditions) {
    if (condition.status === 'True') {
      if (errorTypes.includes(condition.type)) {
        return { status: 'Error', message: condition.message };
      }
    }
  }

  for (const condition of host.status.conditions) {
    if (condition.status === 'True') {
      if (runningTypes.includes(condition.type)) {
        return { status: 'Running', message: condition.message };
      }
    }
  }

  return { status: 'unknown', message: '' };
}
