import { SecretFieldsId } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

import { getCACertValue } from './getCACertValue';
import { getDecodedValue } from './getDecodedValue';

const CA_CERT_FIELD_ID: string = SecretFieldsId.CaCert;

export const getCredentialFieldValue = (
  secret: IoK8sApiCoreV1Secret,
  fieldKey: string,
): string | undefined =>
  fieldKey === CA_CERT_FIELD_ID
    ? getCACertValue(secret)
    : getDecodedValue(secret?.data?.[fieldKey]);
