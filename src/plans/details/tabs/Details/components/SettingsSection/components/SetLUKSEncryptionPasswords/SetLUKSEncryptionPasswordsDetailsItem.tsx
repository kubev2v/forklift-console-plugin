import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { VIRT_V2V_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';

import LUKSSecretLink from './components/LUKSSecretLink';
import EditLUKSEncryptionPasswords from './EditLUKSEncryptionPasswords';

const SetLUKSEncryptionPasswordsDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  if (!shouldRender) return null;

  return (
    <DetailsItem
      title={t('Disk decryption passphrases')}
      content={<LUKSSecretLink plan={plan} />}
      helpContent={t(
        'Specify a list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for the VMs that you want to migrate.',
      )}
      moreInfoLink={VIRT_V2V_HELP_LINK}
      crumbs={['spec', 'vms', 'luks']}
      onEdit={() => {
        showModal(<EditLUKSEncryptionPasswords resource={plan} />);
      }}
      canEdit={canPatch && isPlanEditable(plan)}
    />
  );
};
export default SetLUKSEncryptionPasswordsDetailsItem;
