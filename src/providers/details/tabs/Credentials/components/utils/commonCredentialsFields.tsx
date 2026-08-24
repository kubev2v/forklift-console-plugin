import { t } from '@utils/i18n';

import { CacertHelperTextPopover } from '../CacertHelperTextPopover';
import { InsecureSkipVerifyHelperTextPopover } from '../InsecureSkipVerifyHelperTextPopover';

import type { Field } from './types';

export const insecureSkipVerifyField: Field = {
  description: t("If true, the provider's CA certificate won't be validated."),
  displayType: 'switch',
  helperTextPopover: <InsecureSkipVerifyHelperTextPopover />,
  label: t('Skip certificate validation'),
};

export const cacertField: Field = {
  description: t(
    'A CA certificate to be trusted when connecting to the API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
  ),
  displayType: 'textArea',
  helperTextPopover: <CacertHelperTextPopover />,
  label: t('CA certificate'),
};

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

export const regionNameField: Field = {
  description: t('OpenStack region name.'),
  label: t('Region'),
};

export const projectNameField: Field = {
  description: t('OpenStack project name.'),
  label: t('Project'),
};

export const domainNameField: Field = {
  description: t('OpenStack domain name.'),
  label: t('Domain'),
};
