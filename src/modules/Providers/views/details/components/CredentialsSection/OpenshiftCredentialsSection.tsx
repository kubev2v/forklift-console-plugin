import React from 'react';
import { openshiftSecretValidator } from 'src/modules/Providers/utils';

import {
  BaseCredentialsSection,
  BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { OpenshiftCredentialsEdit } from './components/edit/OpenshiftCredentialsEdit';
import { OpenshiftCredentialsList } from './components/list/OpenshiftCredentialsList';

export type OpenshiftCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const OpenshiftCredentialsSection: React.FC<OpenshiftCredentialsSectionProps> = (props) => {
  return (
    <BaseCredentialsSection
      {...props}
      validator={openshiftSecretValidator}
      ListComponent={OpenshiftCredentialsList}
      EditComponent={OpenshiftCredentialsEdit}
    />
  );
};
