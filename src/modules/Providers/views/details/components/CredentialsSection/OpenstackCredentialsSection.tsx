import type { FC } from 'react';
import { openstackSecretValidator } from 'src/modules/Providers/utils/validators/provider/openstack/openstackSecretValidator';

import {
  BaseCredentialsSection,
  type BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { OpenstackCredentialsEdit } from './components/edit/OpenstackCredentialsEdit';
import { OpenstackCredentialsList } from './components/list/OpenstackCredentialsList';

type OpenstackCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const OpenstackCredentialsSection: FC<OpenstackCredentialsSectionProps> = (props) => (
  <BaseCredentialsSection
    {...props}
    validator={openstackSecretValidator}
    ListComponent={OpenstackCredentialsList}
    EditComponent={OpenstackCredentialsEdit}
  />
);
