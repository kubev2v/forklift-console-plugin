import { t } from '@utils/i18n';

import type { Ec2TargetResolutionFailure } from '../types';

const MAX_ERROR_DETAIL_LENGTH = 200;

const truncateErrorDetail = (detail: string): string =>
  detail.length > MAX_ERROR_DETAIL_LENGTH
    ? `${detail.slice(0, MAX_ERROR_DETAIL_LENGTH)}...`
    : detail;

/**
 * Builds the user-facing copy at call time so language changes are picked up.
 */
const getEc2TargetResolutionMessage = (
  reason: Ec2TargetResolutionFailure,
  detail?: string,
): string => {
  switch (reason) {
    case 'secretForbidden':
      return t(
        'You do not have permission to read the kube-system/aws-creds secret. Ask a cluster administrator for access, or enter the target settings manually.',
      );
    case 'secretNotFound':
      return t(
        'The kube-system/aws-creds secret was not found. It is created on AWS installer-provisioned clusters only. Enter the target settings manually.',
      );
    case 'secretInvalid':
      return t(
        'The kube-system/aws-creds secret does not contain aws_access_key_id and aws_secret_access_key. Enter the target settings manually.',
      );
    case 'nodesForbidden':
      return t(
        'You do not have permission to list cluster nodes, so the target availability zone could not be detected. Enter the target settings manually.',
      );
    case 'noWorkerZone':
      return t(
        'No worker node with a topology.kubernetes.io/zone label was found. Enter the target availability zone manually.',
      );
    case 'unknown':
    default:
      return detail
        ? t(
            'The target settings could not be detected: {{message}}. Enter the target settings manually.',
            { message: truncateErrorDetail(detail) },
          )
        : t(
            'The target settings could not be detected because of an unexpected error. Enter the target settings manually.',
          );
  }
};

// Long-term this resolution belongs in the operator: if the Provider contract ever exposes
// server-side target resolution, this client-side resolver becomes a compatibility adapter only.
export class Ec2TargetResolutionError extends Error {
  public readonly reason: Ec2TargetResolutionFailure;

  public constructor(reason: Ec2TargetResolutionFailure, detail?: string) {
    super(getEc2TargetResolutionMessage(reason, detail));
    this.name = 'Ec2TargetResolutionError';
    this.reason = reason;
  }
}
