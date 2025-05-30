/* eslint-disable perfectionist/sort-objects */

import type { FC } from 'react';
import { decode } from 'js-base64';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import type { Fields } from 'src/modules/Providers/views/details/components/CredentialsSection/components/list/Fields';
import { FieldWithClipboardCopy } from 'src/modules/Providers/views/details/components/CredentialsSection/FieldWithClipboardCopy';
import { MaskedField } from 'src/modules/Providers/views/details/components/CredentialsSection/MaskedField';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList, Text, TextVariants } from '@patternfly/react-core';

import { CacertHelperTextPopover, InsecureSkipVerifyHelperTextPopover } from './utils/constants';
import { getAuthTypeSecretFields } from './utils/getAuthTypeSecretFields';
import { getDecodedValue } from './utils/getDecodedValue';
import type { CredentialsViewModeByTypeProps } from './utils/types';

const OpenstackCredentialsViewMode: FC<CredentialsViewModeByTypeProps> = ({ reveal, secret }) => {
  const { t } = useForkliftTranslation();

  const fields: Record<string, Fields> = {
    applicationCredentialIdSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
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
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: InsecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        helperTextPopover: CacertHelperTextPopover,
        label: t('CA certificate'),
      },
    },

    applicationCredentialNameSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
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
      username: {
        description: t(
          t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
        ),
        label: t('Username'),
      },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      domainName: { description: t('OpenStack domain name.'), label: t('Domain') },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        helperTextPopover: CacertHelperTextPopover,
        label: t('CA certificate'),
      },

      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: InsecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
    },

    passwordSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
      username: {
        description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
        label: t('Username'),
      },
      password: {
        description: t(
          'A user password for connecting to the OpenStack Identity (Keystone) endpoint.',
        ),
        label: t('Password'),
      },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      domainName: { description: t('OpenStack domain name.'), label: t('Domain') },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: InsecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      cacert: {
        description: t(
          'A CA certificate to be trusted when connecting to the OpenStack Identity (Keystone) endpoint. Ensure the CA certificate format is valid. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
        ),
        displayType: 'textArea',
        helperTextPopover: CacertHelperTextPopover,
        label: t('CA certificate'),
      },
    },

    tokenWithUserIDSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
      token: {
        description: t('OpenStack token for authentication using a user ID.'),
        label: t('Token'),
      },
      userID: {
        description: t('A user ID for connecting to the OpenStack Identity (Keystone) endpoint.'),
        label: t('User ID'),
      },
      projectID: { description: t('OpenStack project ID.'), label: t('Project ID') },
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: InsecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        helperTextPopover: CacertHelperTextPopover,
        label: t('CA certificate'),
      },
    },

    tokenWithUsernameSecretFields: {
      authType: {
        description: t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        ),
        label: t('Authentication type'),
      },
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
      regionName: { description: t('OpenStack region name.'), label: t('Region') },
      projectName: { description: t('OpenStack project name.'), label: t('Project') },
      domainName: { description: t('OpenStack domain name.'), label: t('Domain name') },
      insecureSkipVerify: {
        description: t('Migrate without validating a CA certificate'),
        displayType: 'switch',
        helperTextPopover: InsecureSkipVerifyHelperTextPopover,
        label: t('Skip certificate validation'),
      },
      cacert: {
        description: t(
          'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
        ),
        displayType: 'textArea',
        helperTextPopover: CacertHelperTextPopover,
        label: t('CA certificate'),
      },
    },
  };

  const decodedAuthType = getDecodedValue(secret?.data?.authType);
  const openstackSecretFields: Fields = getAuthTypeSecretFields(secret, fields, decodedAuthType);
  const items: JSX.Element[] = [];

  Object.entries(openstackSecretFields).forEach(([key, field]) => {
    const base64Value = secret?.data?.[key];
    const value = base64Value ? decode(base64Value) : undefined;

    items.push(
      <>
        <div className="forklift-page-secret-title-div">
          <DescriptionList className="forklift-page-secret-title">
            <DetailsItem
              title={field.label}
              helpContent={
                key === 'insecureSkipVerify' || key === 'cacert' ? (
                  <Text>{field?.helperTextPopover}</Text>
                ) : null
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
          {reveal ? <FieldWithClipboardCopy field={field} value={value ?? ''} /> : <MaskedField />}
        </div>
      </>,
    );
  });

  return <>{items}</>;
};

export default OpenstackCredentialsViewMode;
