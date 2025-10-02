import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
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
      title={t('Disk decryption')}
      content={<LUKSSecretLink plan={plan} />}
      helpContent={t(
        'Configure disk decryption settings including passphrases for LUKS-encrypted devices or network-bound disk encryption (NBDE/Clevis) for the VMs you want to migrate.',
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
