import React from 'react';
import { openstackSecretValidator } from 'src/modules/Providers/utils';

import {
  BaseCredentialsSection,
  BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { OpenstackCredentialsEdit } from './components/edit/OpenstackCredentialsEdit';
import { OpenstackCredentialsList } from './components/list/OpenstackCredentialsList';

export type OpenstackCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const OpenstackCredentialsSection: React.FC<OpenstackCredentialsSectionProps> = (props) => (
  <BaseCredentialsSection
    {...props}
    validator={openstackSecretValidator}
    ListComponent={OpenstackCredentialsList}
    EditComponent={OpenstackCredentialsEdit}
  />
);
