import { t } from '@utils/i18n';

/**
 * Thrown when cross-account mode is enabled with only one of the target credential keys filled.
 * The message is built at call time so language changes are picked up.
 */
export class Ec2CrossAccountCredentialsError extends Error {
  public constructor() {
    super(
      t(
        'Cross-account credentials require both the target access key ID and the target secret access key. Enter both values, or disable cross-account credentials.',
      ),
    );
    this.name = 'Ec2CrossAccountCredentialsError';
  }
}
