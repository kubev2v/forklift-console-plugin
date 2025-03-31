import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { esxiSecretValidator } from 'src/modules/Providers/utils';

import {
  BaseCredentialsSection,
  type BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { EsxiCredentialsEdit } from './components/edit/EsxiCredentialsEdit';
import { EsxiCredentialsList } from './components/list';

export type EsxiCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const EsxiCredentialsSection: React.FC<EsxiCredentialsSectionProps> = (props) => (
  <ModalHOC>
    <BaseCredentialsSection
      {...props}
      validator={esxiSecretValidator}
      ListComponent={EsxiCredentialsList}
      EditComponent={EsxiCredentialsEdit}
    />
  </ModalHOC>
);
