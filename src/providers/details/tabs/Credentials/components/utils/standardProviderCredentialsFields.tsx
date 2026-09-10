import { ForkliftTrans, t } from '@utils/i18n';

import { cacertField, insecureSkipVerifyField } from './commonCredentialsFields';
import type { Fields } from './types';

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

export const ec2CredentialsFields: Fields = {
  accessKeyId: {
    description: t('AWS access key ID for authenticating to the EC2 API.'),
    label: t('Access key ID'),
  },
  secretAccessKey: {
    description: t('AWS secret access key for authenticating to the EC2 API.'),
    label: t('Secret access key'),
  },
};

export const hypervCredentialsFields: Fields = {
  cacert: {
    ...cacertField,
    description: t(
      'A CA certificate to be trusted when connecting to the Hyper-V host. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  },
  insecureSkipVerify: {
    ...insecureSkipVerifyField,
    description: t("If true, the Hyper-V host's TLS certificate won't be validated."),
  },
  password: {
    description: t('A password for connecting to the Hyper-V host.'),
    label: t('Password'),
  },
  username: {
    description: t(
      'A username for connecting to the Hyper-V host. For example: DOMAIN\\username or username.',
    ),
    label: t('Username'),
  },
};

export const nutanixCredentialsFields: Fields = {
  cacert: {
    ...cacertField,
    description: t(
      'A CA certificate to be trusted when connecting to the Nutanix Prism API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  },
  insecureSkipVerify: {
    ...insecureSkipVerifyField,
    description: t("If true, the Prism endpoint's TLS certificate won't be validated."),
  },
  password: {
    description: t('A password for connecting to the Nutanix Prism API endpoint.'),
    label: t('Password'),
  },
  user: {
    description: t('A username for connecting to the Nutanix Prism API endpoint.'),
    label: t('Username'),
  },
};
