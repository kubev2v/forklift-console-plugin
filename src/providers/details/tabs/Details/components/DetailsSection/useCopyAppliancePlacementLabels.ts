import { useForkliftTranslation } from '@utils/i18n';

import type { CopyApplianceSettingField } from './copyAppliancePlacementConfig';

export type CopyAppliancePlacementFieldLabels = Record<
  CopyApplianceSettingField,
  { help: string; label: string; placeholder: string }
>;

export const useCopyAppliancePlacementLabels = (): CopyAppliancePlacementFieldLabels => {
  const { t } = useForkliftTranslation();
  return {
    datastore: {
      help: t('Datastore used to store the copy appliance template disk.'),
      label: t('Datastore'),
      placeholder: t('Select a datastore'),
    },
    folder: {
      help: t('Inventory folder path for the copy appliance template VM.'),
      label: t('Folder'),
      placeholder: t('Select a folder'),
    },
    network: {
      help: t('Network attached to the copy appliance template VM.'),
      label: t('Network'),
      placeholder: t('Select a network'),
    },
    resourcePool: {
      help: t('Resource pool for copy appliance clones.'),
      label: t('Resource pool'),
      placeholder: t('Select a resource pool'),
    },
  };
};
