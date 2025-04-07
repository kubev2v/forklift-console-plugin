import type { FC } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Label, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import type { PlanDetailsItemProps } from '../../DetailsSection/components/PlanDetailsItemProps';
import { VIRT_V2V_HELP_LINK } from '../modals/EditLUKSEncryptionPasswords/editLUKSModalBody';
import { EditRootDisk } from '../modals/EditRootDisk/EditRootDisk';
import { getRootDiskLabelByKey } from '../modals/EditRootDisk/getRootDiskLabelByKey';

export const RootDiskDetailsItem: FC<PlanDetailsItemProps> = ({
  canPatch,
  helpContent,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultHelpContent = t(`Choose the root filesystem to be converted.`);

  const rootDisk = resource?.spec?.vms?.[0].rootDisk;

  return (
    <DetailsItem
      title={t('Root device')}
      content={getDiskLabel(rootDisk)}
      helpContent={helpContent ?? defaultHelpContent}
      moreInfoLink={VIRT_V2V_HELP_LINK}
      crumbs={['spec', 'vms', 'rootDisk']}
      onEdit={
        canPatch &&
        isPlanEditable(resource) &&
        (() => {
          showModal(<EditRootDisk resource={resource} />);
        })
      }
    />
  );
};

/**
 * Generates a label component for the given disk key.
 * @param {string} diskKey - The key representing the disk option.
 * @returns {JSX.Element} The label component for the disk.
 */
const getDiskLabel = (diskKey: string) => {
  const diskLabel = getRootDiskLabelByKey(diskKey);

  // First boot disk, color green
  if (!diskKey) {
    return (
      <Label isCompact color={'green'}>
        {diskLabel}
      </Label>
    );
  }

  // Known boot disk format, color grey.
  if (diskKey.startsWith('/dev/sd')) {
    return (
      <Label isCompact color={'grey'}>
        {diskLabel}
      </Label>
    );
  }

  // Unknown boot disk format.
  return (
    <Tooltip
      content={
        'Root filesystem format should start with "/dev/sd[X]", see documentation for more information.'
      }
    >
      <Label isCompact color={'orange'}>
        <span className="forklift-page-plan-settings-icon">
          <ExclamationTriangleIcon color="#F0AB00" />
        </span>
        {diskLabel}
      </Label>
    </Tooltip>
  );
};
