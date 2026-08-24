import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/planStatusPermissions';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { VIRT_V2V_HELP_LINK } from '@utils/links';

import type { EditableDetailsItemProps } from '../../../utils/types';
import type { EditPlanProps } from '../../utils/types';

import LUKSSecretLink from './components/LUKSSecretLink';
import EditLUKSEncryptionPasswords from './EditLUKSEncryptionPasswords';

const SetLUKSEncryptionPasswordsDetailsItem: FC<EditableDetailsItemProps> = ({
  canPatch,
  plan,
  shouldRender,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (!shouldRender) {
    return null;
  }

  return (
    <DetailsItem
      canEdit={canPatch && isPlanEditable(plan)}
      content={<LUKSSecretLink plan={plan} />}
      crumbs={['spec', 'vms', 'luks']}
      helpContent={t(
        'Configure disk decryption settings including passphrases for LUKS-encrypted devices or network-bound disk encryption (NBDE/Clevis) for the VMs you want to migrate.',
      )}
      moreInfoLink={VIRT_V2V_HELP_LINK}
      onEdit={() => {
        launchOverlay<EditPlanProps>(EditLUKSEncryptionPasswords, { resource: plan });
      }}
      testId="disk-decryption-detail-item"
      title={t('Disk decryption')}
    />
  );
};
export default SetLUKSEncryptionPasswordsDetailsItem;
