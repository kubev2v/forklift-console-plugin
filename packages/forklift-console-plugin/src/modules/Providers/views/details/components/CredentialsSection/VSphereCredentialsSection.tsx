import React from 'react';
import { vsphereSecretValidator } from 'src/modules/Providers/utils';

import {
  BaseCredentialsSection,
  BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { VSphereCredentialsEdit } from './components/edit/VSphereCredentialsEdit';
import { VSphereCredentialsList } from './components/list/VSphereCredentialsList';

export type VSphereCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const VSphereCredentialsSection: React.FC<VSphereCredentialsSectionProps> = (props) => (
  <BaseCredentialsSection
    {...props}
    validator={vsphereSecretValidator}
    ListComponent={VSphereCredentialsList}
    EditComponent={VSphereCredentialsEdit}
  />
);
