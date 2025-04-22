import type { FC } from 'react';
import { ovirtSecretValidator } from 'src/modules/Providers/utils/validators/provider/ovirt/ovirtSecretValidator';

import {
  BaseCredentialsSection,
  type BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { OvirtCredentialsEdit } from './components/edit/OvirtCredentialsEdit';
import { OvirtCredentialsList } from './components/list/OvirtCredentialsList';

type OvirtCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const OvirtCredentialsSection: FC<OvirtCredentialsSectionProps> = (props) => (
  <BaseCredentialsSection
    {...props}
    validator={ovirtSecretValidator}
    ListComponent={OvirtCredentialsList}
    EditComponent={OvirtCredentialsEdit}
  />
);
