import type {
  Field,
  Fields,
} from 'src/modules/Providers/views/details/components/CredentialsSection/components/list/Fields';
import { t } from 'src/utils/i18n';

import { CacertHelperTextPopover, InsecureSkipVerifyHelperTextPopover } from './constants';

export const authTypeField: Field = {
  description: t(
    'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
  ),
  label: t('Authentication type'),
};

export const insecureSkipVerifyField: Field = {
  description: t('Migrate without validating a CA certificate'),
  displayType: 'switch',
  helperTextPopover: InsecureSkipVerifyHelperTextPopover,
  label: t('Skip certificate validation'),
};

export const cacertField: Field = {
  description: t(
    'A CA certificate to be trusted when connecting to the OpenStack Identity (Keystone) endpoint. Ensure the CA certificate format is valid. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
  ),
  displayType: 'textArea',
  helperTextPopover: CacertHelperTextPopover,
  label: t('CA certificate'),
};

export const OpenStackCredentialsFields: Record<string, Fields> = {
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
    domainName: { description: t('OpenStack domain name.'), label: t('Domain') },
    projectName: { description: t('OpenStack project name.'), label: t('Project') },
    regionName: { description: t('OpenStack region name.'), label: t('Region') },

    username: {
      description: t(t('A username for connecting to the OpenStack Identity (Keystone) endpoint.')),
      label: t('Username'),
    },
  },

  passwordSecretFields: {
    domainName: { description: t('OpenStack domain name.'), label: t('Domain') },
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
    domainName: { description: t('OpenStack domain name.'), label: t('Domain') },
    projectName: { description: t('OpenStack project name.'), label: t('Project') },
    regionName: { description: t('OpenStack region name.'), label: t('Region') },
    token: {
      description: t('OpenStack token for authentication using a user name.'),
      label: t('Token'),
    },
    username: {
      description: t(t('A username for connecting to the OpenStack Identity (Keystone) endpoint.')),
      label: t('Username'),
    },
  },
};
