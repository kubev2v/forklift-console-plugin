import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { createProviderTopic } from '../createProviderTopic';

const getStepIds = (providerType: string): string[] => {
  const subTopics = createProviderTopic.subTopics?.(providerType as never) ?? [];

  return subTopics.map((subTopic) => subTopic.id);
};

describe('createProviderTopic sub topics', () => {
  it('returns the Azure provider creation steps for the azure provider type', () => {
    expect(getStepIds(PROVIDER_TYPES.azure)).toContain('azure-create-provider-steps');
  });

  it('returns the EC2 provider creation steps for the ec2 provider type', () => {
    expect(getStepIds(PROVIDER_TYPES.ec2)).toContain('ec2-create-provider-steps');
  });
});
