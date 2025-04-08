import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { vcenterSecretValidator } from 'src/modules/Providers/utils/validators/provider/vsphere/vcenterSecretValidator';

import {
  BaseCredentialsSection,
  type BaseCredentialsSectionProps,
} from './components/BaseCredentialsSection';
import { VCenterCredentialsEdit } from './components/edit/VCenterCredentialsEdit';
import { VCenterCredentialsList } from './components/list/VCenterCredentialsList';

type VCenterCredentialsSectionProps = Omit<
  BaseCredentialsSectionProps,
  'ListComponent' | 'EditComponent' | 'validator'
>;

export const VCenterCredentialsSection: FC<VCenterCredentialsSectionProps> = (props) => (
  <ModalHOC>
    <BaseCredentialsSection
      {...props}
      validator={vcenterSecretValidator}
      ListComponent={VCenterCredentialsList}
      EditComponent={VCenterCredentialsEdit}
    />
  </ModalHOC>
);
