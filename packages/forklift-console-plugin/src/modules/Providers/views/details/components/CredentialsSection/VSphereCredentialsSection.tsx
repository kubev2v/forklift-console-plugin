import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
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
  <ModalHOC>
    <BaseCredentialsSection
      {...props}
      validator={vsphereSecretValidator}
      ListComponent={VSphereCredentialsList}
      EditComponent={VSphereCredentialsEdit}
    />
  </ModalHOC>
);
