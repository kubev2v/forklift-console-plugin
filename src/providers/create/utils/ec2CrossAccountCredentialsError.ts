import { t } from '@utils/i18n';

const EC2_CROSS_ACCOUNT_CREDENTIALS_ERROR_NAME = 'Ec2CrossAccountCredentialsError';

/**
 * Built when cross-account mode is enabled with only one of the target credential keys filled.
 * The message is built at call time so language changes are picked up.
 */
export const createEc2CrossAccountCredentialsError = (): Error =>
  Object.assign(
    new Error(
      t(
        'Cross-account credentials require both the target access key ID and the target secret access key. Enter both values, or disable cross-account credentials.',
      ),
    ),
    { name: EC2_CROSS_ACCOUNT_CREDENTIALS_ERROR_NAME },
  );
