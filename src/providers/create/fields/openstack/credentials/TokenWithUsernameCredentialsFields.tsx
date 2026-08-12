import type { FC } from 'react';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { Form } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../../constants';
import ProviderFormPasswordInput from '../../ProviderFormPasswordInput';
import ProviderFormTextInput from '../../ProviderFormTextInput';

import { validateOpenstackField } from './useOpenstackFieldValidation';

const TokenWithUsernameCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Form>
      <ProviderFormPasswordInput
        fieldId={ProviderFormFieldId.OpenstackToken}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.Token),
        }}
        helperText={t('Authentication token for OpenStack')}
        label={t('Token')}
        testId="openstack-token-input"
      />

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackUsername}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.Username),
        }}
        helperText={t('Username for connecting to OpenStack Identity (Keystone)')}
        label={t('Username')}
        testId="openstack-username-input"
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

      <ProviderFormTextInput
        fieldId={ProviderFormFieldId.OpenstackDomainName}
        fieldRules={{
          validate: validateOpenstackField(OpenstackSecretFieldsId.DomainName),
        }}
        label={t('Domain')}
        testId="openstack-domain-input"
      />
    </Form>
  );
};

export default TokenWithUsernameCredentialsFields;
