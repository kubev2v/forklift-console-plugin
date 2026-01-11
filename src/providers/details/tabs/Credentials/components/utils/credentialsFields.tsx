import { ForkliftTrans, t } from '@utils/i18n';

import { CacertHelperTextPopover } from '../CacertHelperTextPopover';
import { InsecureSkipVerifyHelperTextPopover } from '../InsecureSkipVerifyHelperTextPopover';

import type { Field, Fields } from './types';

// Common fields used across multiple provider types
const insecureSkipVerifyField: Field = {
  description: t("If true, the provider's CA certificate won't be validated."),
  displayType: 'switch',
  helperTextPopover: <InsecureSkipVerifyHelperTextPopover />,
  label: t('Skip certificate validation'),
};

const cacertField: Field = {
  description: t(
    'A CA certificate to be trusted when connecting to the API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
  ),
  displayType: 'textArea',
  helperTextPopover: <CacertHelperTextPopover />,
  label: t('CA certificate'),
};

// vCenter fields
export const vCenterCredentialsFields: Fields = {
  cacert: {
    ...cacertField,
    description: t(
      'A CA certificate to be trusted when connecting to the vCenter API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  },
  insecureSkipVerify: {
    ...insecureSkipVerifyField,
    description: t("If true, the provider's TLS certificate won't be validated."),
  },
  password: {
    description: t('A user password for connecting to the vCenter API endpoint. [required]'),
    label: t('Password'),
  },
  user: {
    description: (
      <ForkliftTrans>
        A username for connecting to the vCenter API endpoint. Ensure the username includes the user
        domain. For example: <strong>user@vsphere.local</strong>.
      </ForkliftTrans>
    ),
    label: t('Username'),
  },
};

// ESXi fields
export const esxiCredentialsFields: Fields = {
  cacert: {
    ...cacertField,
    description: t(
      'A CA certificate to be trusted when connecting to the ESXi API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  },
  insecureSkipVerify: {
    ...insecureSkipVerifyField,
    description: t("If true, the provider's TLS certificate won't be validated."),
  },
  password: {
    description: t('A user password for connecting to the ESXi API endpoint.'),
    label: t('Password'),
  },
  user: {
    description: (
      <ForkliftTrans>
        A username and domain for connecting to the ESXi API endpoint. For example:{' '}
        <strong>user</strong>.
      </ForkliftTrans>
    ),
    label: t('Username'),
  },
};

// oVirt (RHV) fields
export const ovirtCredentialsFields: Fields = {
  cacert: {
    ...cacertField,
    description: t(
      'A CA certificate to be trusted when connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  },
  insecureSkipVerify: insecureSkipVerifyField,
  password: {
    description: t(
      'A user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
    ),
    label: t('Password'),
  },
  user: {
    description: t(
      'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the username is in the format of username@user-domain. For example: admin@internal.',
    ),
    label: t('Username'),
  },
};

// OpenShift fields
export const openshiftCredentialsFields: Fields = {
  cacert: {
    ...cacertField,
    description: t(
      'A CA certificate to be trusted when connecting to Openshift API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  },
  insecureSkipVerify: insecureSkipVerifyField,
  token: {
    description: (
      <ForkliftTrans>
        A service account token with cluster admin privileges, required for authenticating the
        connection to the API server.
      </ForkliftTrans>
    ),
    label: t('Service account bearer token'),
  },
};

// OpenStack common fields
export const openstackAuthTypeField: Field = {
  description: t(
    'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
  ),
  label: t('Authentication type'),
};

export const openstackInsecureSkipVerifyField: Field = {
  description: t('Migrate without validating a CA certificate'),
  displayType: 'switch',
  helperTextPopover: <InsecureSkipVerifyHelperTextPopover />,
  label: t('Skip certificate validation'),
};

export const openstackCacertField: Field = {
  description: t(
    'A CA certificate to be trusted when connecting to the OpenStack Identity (Keystone) endpoint. Ensure the CA certificate format is valid. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
  ),
  displayType: 'textArea',
  helperTextPopover: <CacertHelperTextPopover />,
  label: t('CA certificate'),
};

// OpenStack auth type specific fields
const regionName: Field = {
  description: t('OpenStack region name.'),
  label: t('Region'),
};

const projectName: Field = {
  description: t('OpenStack project name.'),
  label: t('Project'),
};

const domainName: Field = {
  description: t('OpenStack domain name.'),
  label: t('Domain'),
};
export const openstackPasswordFields: Fields = {
  domainName,
  password: {
    description: t('A user password for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('Password'),
  },
  projectName,
  regionName,
  username: {
    description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('Username'),
  },
};

export const openstackTokenWithUsernameFields: Fields = {
  domainName,
  projectName,
  regionName,
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
  regionName,
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
  projectName,
  regionName,
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
  domainName,
  projectName,
  regionName,
  username: {
    description: t('A username for connecting to the OpenStack Identity (Keystone) endpoint.'),
    label: t('Username'),
  },
};
