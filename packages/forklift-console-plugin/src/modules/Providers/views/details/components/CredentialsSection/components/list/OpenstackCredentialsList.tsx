import React from 'react';
import { Base64 } from 'js-base64';
import { DetailsItem } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  ClipboardCopy,
  ClipboardCopyVariant,
  DescriptionList,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { MaskedData } from '../../MaskedData';
import { ListComponentProps } from '../BaseCredentialsSection';

export const OpenstackCredentialsList: React.FC<ListComponentProps> = ({ secret, reveal }) => {
  const { t } = useForkliftTranslation();

  const usernameHelperTextMsg = t(
    'A username for connecting to the OpenStack Identity (Keystone) endpoint.',
  );
  const passwordHelperTextMsg = t(
    'A user password for connecting to the OpenStack Identity (Keystone) endpoint.',
  );
  const regionHelperTextMsg = t('OpenStack region name.');
  const projectNameHelperTextMsg = t('OpenStack project name.');
  const domainHelperTextMsg = t('OpenStack domain name.');
  const tokenWithUserIdHelperTextMsg = t('OpenStack token for authentication using a user ID.');
  const tokenWithUsernameHelperTextMsg = t('OpenStack token for authentication using a user name.');
  const userIdHelperTextMsg = t(
    'A user ID for connecting to the OpenStack Identity (Keystone) endpoint.',
  );
  const projectIdHelperTextMsg = t('OpenStack project ID.');
  const applicationCredentialIDHelperTextMsg = t(
    'OpenStack application credential ID needed for the application credential authentication.',
  );
  const applicationCredentialNameHelperTextMsg = t(
    'OpenStack application credential name needed for application credential authentication.',
  );
  const applicationCredentialSecretHelperTextMsg = t(
    'OpenStack application credential Secret needed for the application credential authentication.',
  );
  const items = [];

  const fields = {
    passwordSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
      },
      username: { label: t('Username'), description: usernameHelperTextMsg },
      password: { label: t('Password'), description: passwordHelperTextMsg },
      regionName: { label: t('Region'), description: regionHelperTextMsg },
      projectName: { label: t('Project'), description: projectNameHelperTextMsg },
      domainName: { label: t('Domain'), description: domainHelperTextMsg },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t(
          "If true (check box is selected), the provider's CA certificate won't be validated.",
        ),
        helperTextPopover: (
          <ForkliftTrans>
            Note: If this field is checked/true, migrations from this provider will not be secure,
            meaning that the transferred data is sent over an insecure connection and potentially
            sensitive data could be exposed.
          </ForkliftTrans>
        ),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'A CA certificate to be trusted when connecting to the OpenStack Identity (Keystone) endpoint. Ensure the CA certificate format is valid. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
        ),
      },
    },

    tokenWithUserIDSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
      },
      token: { label: t('Token'), description: tokenWithUserIdHelperTextMsg },
      userID: { label: t('User ID'), description: userIdHelperTextMsg },
      projectID: { label: t('Project ID'), description: projectIdHelperTextMsg },
      regionName: { label: t('Region'), description: regionHelperTextMsg },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t(
          "If true (check box is selected), the provider's CA certificate won't be validated.",
        ),
        helperTextPopover: (
          <ForkliftTrans>
            Note: If this field is checked/true, migrations from this provider will not be secure,
            meaning that the transferred data is sent over an insecure connection and potentially
            sensitive data could be exposed.
          </ForkliftTrans>
        ),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the OpenStack REST API server, when empty use system certificate.',
        ),
      },
    },

    tokenWithUsernameSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
      },
      token: { label: t('Token'), description: tokenWithUsernameHelperTextMsg },
      username: { label: t('Username'), description: t(usernameHelperTextMsg) },
      regionName: { label: t('Region'), description: regionHelperTextMsg },
      projectName: { label: t('Project'), description: projectNameHelperTextMsg },
      domainName: { label: t('Domain name'), description: domainHelperTextMsg },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t(
          "If true (check box is selected), the provider's CA certificate won't be validated.",
        ),
        helperTextPopover: (
          <ForkliftTrans>
            Note: If this field is checked/true, migrations from this provider will not be secure,
            meaning that the transferred data is sent over an insecure connection and potentially
            sensitive data could be exposed.
          </ForkliftTrans>
        ),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the OpenStack REST API server, when empty use system certificate.',
        ),
      },
    },

    applicationCredentialIdSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
      },
      applicationCredentialID: {
        label: t('Application credential ID'),
        description: applicationCredentialIDHelperTextMsg,
      },
      applicationCredentialSecret: {
        label: t('Application credential Secret'),
        description: applicationCredentialSecretHelperTextMsg,
      },
      regionName: { label: t('Region'), description: regionHelperTextMsg },
      projectName: { label: t('Project'), description: projectNameHelperTextMsg },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t(
          "If true (check box is selected), the provider's CA certificate won't be validated.",
        ),
        helperTextPopover: (
          <ForkliftTrans>
            Note: If this field is checked/true, migrations from this provider will not be secure,
            meaning that the transferred data is sent over an insecure connection and potentially
            sensitive data could be exposed.
          </ForkliftTrans>
        ),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the OpenStack REST API server, when empty use system certificate.',
        ),
      },
    },

    applicationCredentialNameSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
      },
      applicationCredentialName: {
        label: t('Application credential name'),
        description: applicationCredentialNameHelperTextMsg,
      },
      applicationCredentialSecret: {
        label: t('Application credential Secret'),
        description: applicationCredentialSecretHelperTextMsg,
      },
      username: { label: t('Username'), description: t(usernameHelperTextMsg) },
      regionName: { label: t('Region'), description: regionHelperTextMsg },
      projectName: { label: t('Project'), description: projectNameHelperTextMsg },
      domainName: { label: t('Domain'), description: domainHelperTextMsg },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t(
          "If true (check box is selected), the provider's CA certificate won't be validated.",
        ),
        helperTextPopover: (
          <ForkliftTrans>
            Note: If this field is checked/true, migrations from this provider will not be secure,
            meaning that the transferred data is sent over an insecure connection and potentially
            sensitive data could be exposed.
          </ForkliftTrans>
        ),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the OpenStack REST API server, when empty use system certificate.',
        ),
      },
    },
  };

  let openstackSecretFields = {};

  const decodedAuthType = secret?.data?.authType ? Base64.decode(secret.data.authType) : '';

  switch (decodedAuthType) {
    case '':
    case 'password':
      openstackSecretFields = fields.passwordSecretFields;
      break;

    case 'token':
      if (!secret?.data?.userID) {
        openstackSecretFields = fields.tokenWithUsernameSecretFields;
      } else if (!secret?.data?.username) {
        openstackSecretFields = fields.tokenWithUserIDSecretFields;
      }
      break;

    case 'applicationcredential':
      if (!secret?.data?.applicationCredentialID) {
        openstackSecretFields = fields.applicationCredentialNameSecretFields;
      } else if (!secret?.data?.applicationCredentialName) {
        openstackSecretFields = fields.applicationCredentialIdSecretFields;
      }
      break;

    default:
    // Handle case when none of the conditions are met
  }

  for (const key in openstackSecretFields) {
    const field = openstackSecretFields[key];
    const base64Value = secret.data?.[key];
    const value = base64Value ? Base64.decode(secret.data[key]) : undefined;

    items.push(
      <>
        <div className="forklift-page-secret-title-div">
          <DescriptionList className="forklift-page-secret-title">
            <DetailsItem
              title={field.label}
              helpContent={
                key === 'insecureSkipVerify' ? <Text>{field?.helperTextPopover}</Text> : null
              }
              showHelpIconNextToTitle={true}
              content={''}
            />
          </DescriptionList>
          <Text component={TextVariants.small} className="forklift-page-secret-subtitle">
            {field.description}
          </Text>
        </div>
        <div className="forklift-page-secret-content-div">
          {reveal ? (
            <ClipboardCopy
              isReadOnly
              hoverTip={t('Copy')}
              clickTip={t('Copied')}
              isCode
              variant={value && value.length > 128 ? ClipboardCopyVariant.expansion : undefined}
            >
              {value}
            </ClipboardCopy>
          ) : (
            <MaskedData />
          )}
        </div>
      </>,
    );
  }

  return <>{items}</>;
};
