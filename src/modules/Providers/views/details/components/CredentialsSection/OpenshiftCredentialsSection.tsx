import type { FC } from 'react';
import { openshiftSecretValidator } from 'src/modules/Providers/utils/validators/provider/openshift/openshiftSecretValidator';

import {
  BaseCredentialsSection,
  type BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { OpenshiftCredentialsEdit } from './components/edit/OpenshiftCredentialsEdit';
import { OpenshiftCredentialsList } from './components/list/OpenshiftCredentialsList';

type OpenshiftCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const OpenshiftCredentialsSection: FC<OpenshiftCredentialsSectionProps> = (props) => {
  return (
    <BaseCredentialsSection
      {...props}
      validator={openshiftSecretValidator}
      ListComponent={OpenshiftCredentialsList}
      EditComponent={OpenshiftCredentialsEdit}
    />
  );
};
