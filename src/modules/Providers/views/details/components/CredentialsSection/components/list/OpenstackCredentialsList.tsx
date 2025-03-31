import React from 'react';
import { Base64 } from 'js-base64';
import { DetailsItem } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList, Text, TextVariants } from '@patternfly/react-core';

import { FieldWithClipboardCopy } from '../../FieldWithClipboardCopy';
import { MaskedField } from '../../MaskedField';
import type { ListComponentProps } from '../BaseCredentialsSection';

import type { Fields } from './Fields';

export const OpenstackCredentialsList: React.FC<ListComponentProps> = ({ reveal, secret }) => {
  const { t } = useForkliftTranslation();

  const items = [];

  const insecureSkipVerifyHelperTextPopover = (
    <ForkliftTrans>
      <p>
        Select <strong>Skip certificate validation</strong> to skip certificate verification, which
        proceeds with an insecure migration and then the certificate is not required. Insecure
        migration means that the transferred data is sent over an insecure connection and
        potentially sensitive data could be exposed.
      </p>
    </ForkliftTrans>
  );

  const fields: Record<string, Fields> = {
    applicationCredentialIdSecretFields: {
      applicationCredentialID: {
        description: t(
          'OpenStack application credential ID needed for the application credential authentication.',
        ),
        label: t('Application credential ID'),
      },
      applicationCredentialSecret: {
        description: t(
          'OpenStack application credential Secret needed for the application credential authentication.',
        ),
        label: t('Application credential Secret'),
      },
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        label: t('CA certificate'),
      },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
    },

    applicationCredentialNameSecretFields: {
      applicationCredentialName: {
        description: t(
          'OpenStack application credential name needed for application credential authentication.',
        ),
        label: t('Application credential name'),
      },
      applicationCredentialSecret: {
        description: t(
          'OpenStack application credential Secret needed for the application credential authentication.',
        ),
        label: t('Application credential Secret'),
      },
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        label: t('CA certificate'),
      },
      domainName: { description: t('OpenStack domain name.'), label: t('Domain') },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      username: {
        description: t(
          t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
        ),
        label: t('Username'),
      },
    },

    passwordSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
      cacert: {
        description: t(
          'A CA certificate to be trusted when connecting to the OpenStack Identity (Keystone) endpoint. Ensure the CA certificate format is valid. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
        ),
        displayType: 'textArea',
        label: t('CA certificate'),
      },
      domainName: { description: t('OpenStack domain name.'), label: t('Domain') },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      password: {
        description: t(
          'A user password for connecting to the OpenStack Identity (Keystone) endpoint.',
        ),
        label: t('Password'),
      },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      username: {
        description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
        label: t('Username'),
      },
    },

    tokenWithUserIDSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        label: t('CA certificate'),
      },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      projectID: { description: t('OpenStack project ID.'), label: t('Project ID') },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      token: {
        description: t('OpenStack token for authentication using a user ID.'),
        label: t('Token'),
      },
      userID: {
        description: t('A user ID for connecting to the OpenStack Identity (Keystone) endpoint.'),
        label: t('User ID'),
      },
    },

    tokenWithUsernameSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        label: t('CA certificate'),
      },
      domainName: { description: t('OpenStack domain name.'), label: t('Domain name') },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      token: {
        description: t('OpenStack token for authentication using a user name.'),
        label: t('Token'),
      },
      username: {
        description: t(
          t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
        ),
        label: t('Username'),
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
          {reveal ? <FieldWithClipboardCopy field={field} value={value} /> : <MaskedField />}
        </div>
      </>,
    );
  }

  return <>{items}</>;
};
