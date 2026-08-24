import { t } from '@utils/i18n';

import { domainNameField, projectNameField, regionNameField } from './commonCredentialsFields';
import type { Fields } from './types';

export const openstackPasswordFields: Fields = {
  domainName: domainNameField,
  password: {
    description: t('A user password for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('Password'),
  },
  projectName: projectNameField,
  regionName: regionNameField,
  username: {
    description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('Username'),
  },
};

export const openstackTokenWithUsernameFields: Fields = {
  domainName: domainNameField,
  projectName: projectNameField,
  regionName: regionNameField,
  token: {
    description: t('OpenStack token for authentication using a user name.'),
    label: t('Token'),
  },
  username: {
    description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('Username'),
  },
};

export const openstackTokenWithUserIdFields: Fields = {
  projectID: { description: t('OpenStack project ID.'), label: t('Project ID') },
  regionName: regionNameField,
  token: {
    description: t('OpenStack token for authentication using a user ID.'),
    label: t('Token'),
  },
  userID: {
    description: t('A user ID for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('User ID'),
  },
};

export const openstackApplicationCredentialIdFields: Fields = {
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
  projectName: projectNameField,
  regionName: regionNameField,
};

export const openstackApplicationCredentialNameFields: Fields = {
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
  domainName: domainNameField,
  projectName: projectNameField,
  regionName: regionNameField,
  username: {
    description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('Username'),
  },
};
