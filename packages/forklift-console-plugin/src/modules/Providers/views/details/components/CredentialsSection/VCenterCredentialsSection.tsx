import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { vcenterSecretValidator } from 'src/modules/Providers/utils';

import {
  BaseCredentialsSection,
  BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { VCenterCredentialsEdit } from './components/edit/VCenterCredentialsEdit';
import { VSphereCredentialsList } from './components/list/VSphereCredentialsList';

export type VCenterCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const VCenterCredentialsSection: React.FC<VCenterCredentialsSectionProps> = (props) => (
  <ModalHOC>
    <BaseCredentialsSection
      {...props}
      validator={vcenterSecretValidator}
      ListComponent={VSphereCredentialsList}
      EditComponent={VCenterCredentialsEdit}
    />
  </ModalHOC>
);
