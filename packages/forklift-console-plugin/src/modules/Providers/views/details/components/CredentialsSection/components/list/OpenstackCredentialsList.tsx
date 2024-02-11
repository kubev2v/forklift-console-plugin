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

  const fields = {
    passwordSecretFields: {
      authType: {
        label: t('Authentication type'),
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
      },
      username: {
        label: t('Username'),
        description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
      },
      password: {
        label: t('Password'),
        description: t(
          'A user password for connecting to the OpenStack Identity (Keystone) endpoint.',
        ),
      },
      regionName: { label: t('Region'), description: t('OpenStack region name.') },
      projectName: { label: t('Project'), description: t('OpenStack project name.') },
      domainName: { label: t('Domain'), description: t('OpenStack domain name.') },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t('Migrate without validating a CA certificate'),
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
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
      token: {
        label: t('Token'),
        description: t('OpenStack token for authentication using a user ID.'),
      },
      userID: {
        label: t('User ID'),
        description: t('A user ID for connecting to the OpenStack Identity (Keystone) endpoint.'),
      },
      projectID: { label: t('Project ID'), description: t('OpenStack project ID.') },
      regionName: { label: t('Region'), description: t('OpenStack region name.') },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t('Migrate without validating a CA certificate'),
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case enter the Manager Apache CA certificate.',
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
      token: {
        label: t('Token'),
        description: t('OpenStack token for authentication using a user name.'),
      },
      username: {
        label: t('Username'),
        description: t(
          t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
        ),
      },
      regionName: { label: t('Region'), description: t('OpenStack region name.') },
      projectName: { label: t('Project'), description: t('OpenStack project name.') },
      domainName: { label: t('Domain name'), description: t('OpenStack domain name.') },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t('Migrate without validating a CA certificate'),
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case enter the Manager Apache CA certificate.',
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
        description: t(
          'OpenStack application credential ID needed for the application credential authentication.',
        ),
      },
      applicationCredentialSecret: {
        label: t('Application credential Secret'),
        description: t(
          'OpenStack application credential Secret needed for the application credential authentication.',
        ),
      },
      regionName: { label: t('Region'), description: t('OpenStack region name.') },
      projectName: { label: t('Project'), description: t('OpenStack project name.') },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t('Migrate without validating a CA certificate'),
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case enter the Manager Apache CA certificate.',
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
        description: t(
          'OpenStack application credential name needed for application credential authentication.',
        ),
      },
      applicationCredentialSecret: {
        label: t('Application credential Secret'),
        description: t(
          'OpenStack application credential Secret needed for the application credential authentication.',
        ),
      },
      username: {
        label: t('Username'),
        description: t(
          t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
        ),
      },
      regionName: { label: t('Region'), description: t('OpenStack region name.') },
      projectName: { label: t('Project'), description: t('OpenStack project name.') },
      domainName: { label: t('Domain'), description: t('OpenStack domain name.') },
      insecureSkipVerify: {
        label: t('Skip certificate validation'),
        description: t('Migrate without validating a CA certificate'),
        helperTextPopover: insecureSkipVerifyHelperTextPopover,
      },
      cacert: {
        label: t('CA certificate'),
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case enter the Manager Apache CA certificate.',
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
