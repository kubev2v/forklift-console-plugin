import { ForkliftTrans } from 'src/utils/i18n';

import { t } from '@utils/i18n';

export const TARGET_LABELS_DETAILS_ITEM_DESCRIPTION = t(
  'Specify custom labels that will be applied after migration to all target virtual machines of the migration plan. This can apply organizational or operational labels to migrated virtual machines for further identification and management.',
);

export const TARGET_LABELS_MODAL_DESCRIPTION = (
  <ForkliftTrans>
    <p>{TARGET_LABELS_DETAILS_ITEM_DESCRIPTION}</p>
    <br />
    <p>
      Enter <strong>key=value</strong> pair(s). For example: project=myProject
    </p>
  </ForkliftTrans>
);
