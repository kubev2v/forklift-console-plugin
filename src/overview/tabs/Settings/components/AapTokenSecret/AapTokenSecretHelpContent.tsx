import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const AapTokenSecretHelpContent: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'Select a Kubernetes Secret that contains the AAP API Bearer token. The Secret must have a key named "token" with the token value.',
        )}
      </StackItem>
      <StackItem>
        {t(
          'The Secret must exist in the operator namespace. Create it using: kubectl create secret generic aap-token --from-literal=token=YOUR_TOKEN -n <operator-namespace>',
        )}
      </StackItem>
    </Stack>
  );
};

export default AapTokenSecretHelpContent;
