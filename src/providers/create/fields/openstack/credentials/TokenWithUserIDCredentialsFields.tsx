import type { FC } from 'react';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { Form } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../../constants';
import ProviderFormPasswordInput from '../../ProviderFormPasswordInput';
import ProviderFormTextInput from '../../ProviderFormTextInput';

import { validateOpenstackField } from './useOpenstackFieldValidation';

const TokenWithUserIDCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Form>
      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.OpenstackToken}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.Token),
        }}
        label={t('Token')}
        helperText={t('Authentication token for OpenStack')}
        testId="openstack-token-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackUserId}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.UserId),
        }}
        label={t('User ID')}
        helperText={t('User ID for connecting to OpenStack Identity (Keystone)')}
        testId="openstack-user-id-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackProjectId}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.ProjectId),
        }}
        label={t('Project ID')}
        testId="openstack-project-id-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackRegionName}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.RegionName),
        }}
        label={t('Region')}
        testId="openstack-region-input"
      />
    </Form>
  );
};

export default TokenWithUserIDCredentialsFields;
