import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { vcenterSecretValidator } from 'src/modules/Providers/utils';

import {
  BaseCredentialsSection,
  type BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { VCenterCredentialsEdit } from './components/edit/VCenterCredentialsEdit';
import { VCenterCredentialsList } from './components/list/VCenterCredentialsList';

export type VCenterCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const VCenterCredentialsSection: React.FC<VCenterCredentialsSectionProps> = (props) => (
  <ModalHOC>
    <BaseCredentialsSection
      {...props}
      validator={vcenterSecretValidator}
      ListComponent={VCenterCredentialsList}
      EditComponent={VCenterCredentialsEdit}
    />
  </ModalHOC>
);
