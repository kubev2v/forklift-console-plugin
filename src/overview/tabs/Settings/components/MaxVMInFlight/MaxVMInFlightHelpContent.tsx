import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS } from '@utils/links';

const MaxVMInFlightHelpContent: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Sets the maximum number of virtual machines or disks that can be migrated simultaneously, varies by the source provider type and by the settings of the migration.',
        )}
      </StackItem>
      <StackItem>{t('The default value is 20 virtual machines or disks.')}</StackItem>
      {MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS && (
        <StackItem>
          <a href={MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS} target="_blank" rel="noreferrer">
            {t('Learn more')}
          </a>
        </StackItem>
      )}
    </Stack>
  );
};

export default MaxVMInFlightHelpContent;
