import React from 'react';
import { Base64 } from 'js-base64';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ClipboardCopy, ClipboardCopyVariant, Text, TextVariants } from '@patternfly/react-core';

import { MaskedData } from '../../MaskedData';
import { ListComponentProps } from '../BaseCredentialsSection';

export const OpenstackCredentialsList: React.FC<ListComponentProps> = ({ secret, reveal }) => {
  const { t } = useForkliftTranslation();

  const items = [];

  const fields = {
    passwordSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t('Type of authentication to use when connecting to Openstack REST API.'),
      },
      username: { label: t('Username'), description: t('Openstack REST API user name.') },
      password: {
        label: t('Password'),
        description: t('Openstack REST API password credentials.'),
      },
      regionName: {
        label: t('Region'),
        description: t('Openstack region for password credentials.'),
      },
      projectName: {
        label: t('Project'),
        description: t('Openstack project for password credentials.'),
      },
      domainName: {
        label: t('Domain'),
        description: t('Openstack domain for password credentials.'),
      },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t("If true, the provider's REST API TLS certificate won't be validated."),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the Openstack REST API server, when empty use system certificate.',
        ),
      },
    },

    tokenWithUserIDSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t('Type of authentication to use when connecting to Openstack REST API.'),
      },
      token: {
        label: t('Token'),
        description: t('Openstack REST API token credentials.'),
      },
      userID: {
        label: t('User ID'),
        description: t('Openstack REST API user ID.'),
      },
      projectID: {
        label: t('Project ID'),
        description: t('Openstack project ID for token credentials.'),
      },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t("If true, the provider's REST API TLS certificate won't be validated."),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the Openstack REST API server, when empty use system certificate.',
        ),
      },
    },

    tokenWithUsernameSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t('Type of authentication to use when connecting to Openstack REST API.'),
      },
      token: {
        label: t('Token'),
        description: t('Openstack REST API token credentials.'),
      },
      username: {
        label: t('Username'),
        description: t('Openstack REST API user name.'),
      },
      projectName: {
        label: t('Project'),
        description: t('Openstack project for token credentials.'),
      },
      domainName: {
        label: t('Domain Name'),
        description: t('Openstack domain name for token credentials.'),
      },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t("If true, the provider's REST API TLS certificate won't be validated."),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the Openstack REST API server, when empty use system certificate.',
        ),
      },
    },

    applicationCredentialIdSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t('Type of authentication to use when connecting to Openstack REST API.'),
      },
      applicationCredentialID: {
        label: t('Application Credential ID'),
        description: t('Openstack REST API Application Credential ID.'),
      },
      applicationCredentialSecret: {
        label: t('Application Credential Secret'),
        description: t('Openstack REST API Application Credential Secret.'),
      },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t("If true, the provider's REST API TLS certificate won't be validated."),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the Openstack REST API server, when empty use system certificate.',
        ),
      },
    },

    applicationCredentialNameSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t('Type of authentication to use when connecting to Openstack REST API.'),
      },
      applicationCredentialName: {
        label: t('Application Credential Name'),
        description: t('Openstack REST API Application Credential Name.'),
      },
      applicationCredentialSecret: {
        label: t('Application Credential Secret'),
        description: t('Openstack REST API Application Credential Secret.'),
      },
      username: {
        label: t('Username'),
        description: t('Openstack REST API user name.'),
      },
      domainName: {
        label: t('Domain'),
        description: t('Openstack domain for application credential credentials.'),
      },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t("If true, the provider's REST API TLS certificate won't be validated."),
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'Custom certification used to verify the Openstack REST API server, when empty use system certificate.',
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
          <Text component={TextVariants.h6} className="forklift-page-secret-title">
            {field.label}
          </Text>
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
