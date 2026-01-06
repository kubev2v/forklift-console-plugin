import { type FC, useContext } from 'react';
import { CreateForkliftContext } from 'src/onlineHelp/learningExperienceDrawer/context/ForkliftContext';
import type { ProviderTypes } from 'src/providers/utils/constants';

import { t } from '@utils/i18n';

import { MigrationSourceTypeLabels } from '../utils/constants';

const SelectedSourceMigrationLabel: FC = () => {
  const { learningExperienceContext } = useContext(CreateForkliftContext);
  const migrationSource = learningExperienceContext.data.migrationSource ?? 'vsphere';

  return t(MigrationSourceTypeLabels[migrationSource as ProviderTypes]);
};

export default SelectedSourceMigrationLabel;
