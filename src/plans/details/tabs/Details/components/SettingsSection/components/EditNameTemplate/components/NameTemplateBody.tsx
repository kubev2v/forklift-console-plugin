import { type FC, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  ExpandableSection,
  ExpandableSectionVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

type NameTemplateBodyProps = {
  bodyText: string;
  allowedVariables: string[];
};

const NameTemplateBody: FC<NameTemplateBodyProps> = ({ allowedVariables, bodyText }) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Stack className="pf-v6-u-mb-sm">
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
  );
};

export default NameTemplateBody;
