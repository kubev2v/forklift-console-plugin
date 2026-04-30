import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const AapUrlHelpContent: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        {t('The base URL of the Ansible Automation Platform instance used for migration hooks.')}
      </StackItem>
      <StackItem>
        {t(
          'When set along with the token secret, AAP job templates can be selected as pre/post migration hooks in plan creation.',
        )}
      </StackItem>
    </Stack>
  );
};

export default AapUrlHelpContent;
