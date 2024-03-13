import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { esxiSecretValidator } from 'src/modules/Providers/utils';

import {
  BaseCredentialsSection,
  BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { EsxiCredentialsEdit } from './components/edit/EsxiCredentialsEdit';
import { VSphereCredentialsList } from './components/list/VSphereCredentialsList';

export type EsxiCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const EsxiCredentialsSection: React.FC<EsxiCredentialsSectionProps> = (props) => (
  <ModalHOC>
    <BaseCredentialsSection
      {...props}
      validator={esxiSecretValidator}
      ListComponent={VSphereCredentialsList}
      EditComponent={EsxiCredentialsEdit}
    />
  </ModalHOC>
);
