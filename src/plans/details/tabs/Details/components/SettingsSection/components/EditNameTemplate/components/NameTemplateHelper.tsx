import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelperText, HelperTextItem, Stack, StackItem } from '@patternfly/react-core';

type NameTemplateHelperProps = {
  examples: string[];
};

const NameTemplateHelper: FC<NameTemplateHelperProps> = ({ examples }) => {
  const { t } = useForkliftTranslation();
  return (
    <Stack>
      <HelperText>
        <HelperTextItem>
          <StackItem>{t('Examples:')}</StackItem>
          {examples.map((example) => (
            <StackItem key={example}>{example}</StackItem>
          ))}
        </HelperTextItem>
      </HelperText>
    </Stack>
  );
};

export default NameTemplateHelper;
