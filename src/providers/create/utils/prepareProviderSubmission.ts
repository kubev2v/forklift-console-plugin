import { PROVIDER_TYPES } from '@utils/providers/constants';

import { ProviderFormFieldId } from '../fields/constants';
import type { CreateProviderFormData, ProviderSubmission } from '../types';

import { resolveEc2TargetSettings } from './resolveEc2TargetSettings';

const shouldResolveEc2Target = (formData: CreateProviderFormData): boolean =>
  formData[ProviderFormFieldId.ProviderType] === PROVIDER_TYPES.ec2 &&
  formData[ProviderFormFieldId.Ec2AutoTargetCredentials] === true &&
  formData[ProviderFormFieldId.Ec2UseCrossAccountCredentials] !== true;

export const prepareProviderSubmission = async (
  formData: CreateProviderFormData,
): Promise<ProviderSubmission> => {
  if (!shouldResolveEc2Target(formData)) {
    return { formData };
  }

  const ec2Target = await resolveEc2TargetSettings({
    ec2Region: formData[ProviderFormFieldId.Ec2Region] ?? '',
    formData,
  });

  return { ec2Target, formData };
};
