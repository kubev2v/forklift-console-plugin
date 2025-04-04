import { type FC, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  ExpandableSection,
  ExpandableSectionVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

type NameTemplateModalBodyProps = {
  bodyText: string[];
  allowedVariables: string[];
};

const NameTemplateModalBody: FC<NameTemplateModalBodyProps> = ({ allowedVariables, bodyText }) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Stack>
      <Stack>
        <StackItem>{bodyText}</StackItem>
        <StackItem>
          {t('The VM specific template will override the template set in the plan.')}
        </StackItem>
        <ExpandableSection
          variant={ExpandableSectionVariant.truncate}
          toggleText={isExpanded ? t('Hide variables') : t('Show variables')}
          isExpanded={isExpanded}
          truncateMaxLines={1}
          onToggle={(_, expand) => {
            setIsExpanded(expand);
          }}
        >
          <StackItem>{t('Variables that can be used for the template:')}</StackItem>
          {allowedVariables.map((allowedVariable) => (
            <StackItem key={allowedVariable}>{allowedVariable}</StackItem>
          ))}
        </ExpandableSection>
      </Stack>
    </Stack>
  );
};

export default NameTemplateModalBody;
