import type { FC } from 'react';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { Form } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../../constants';
import ProviderFormPasswordInput from '../../ProviderFormPasswordInput';
import ProviderFormTextInput from '../../ProviderFormTextInput';

import { validateOpenstackField } from './useOpenstackFieldValidation';

const ApplicationCredentialIdCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Form>
      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackApplicationCredentialId}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.ApplicationCredentialId),
        }}
        label={t('Application credential ID')}
        testId="openstack-app-cred-id-input"
      />

      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.OpenstackApplicationCredentialSecret}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.ApplicationCredentialSecret),
        }}
        label={t('Application credential secret')}
        testId="openstack-app-cred-secret-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackRegionName}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.RegionName),
        }}
        label={t('Region')}
        testId="openstack-region-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackProjectName}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.ProjectName),
        }}
        label={t('Project')}
        testId="openstack-project-input"
      />
    </Form>
  );
};

export default ApplicationCredentialIdCredentialsFields;
