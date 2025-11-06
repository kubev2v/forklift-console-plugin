import { type FC, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ExpandableSection, List, ListItem, Stack, StackItem } from '@patternfly/react-core';

type NameTemplateBodyProps = {
  bodyText: string;
  allowedVariables: string[];
};

const NameTemplateBody: FC<NameTemplateBodyProps> = ({ allowedVariables, bodyText }) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Stack hasGutter className="pf-v6-u-mb-md">
      <StackItem>
        <div>{bodyText}</div>
      </StackItem>
      <StackItem>
        <div className="pf-v6-u-color-200">
          {t('The VM specific template will override the template set in the plan.')}
        </div>
      </StackItem>
      <StackItem>
        <ExpandableSection
          toggleText={t('Show variables')}
          toggleTextExpanded={t('Hide variables')}
          isExpanded={isExpanded}
          onToggle={(_, expand) => {
            setIsExpanded(expand);
          }}
          isIndented
        >
          <List>
            {allowedVariables.map((allowedVariable) => (
              <ListItem key={allowedVariable}>{allowedVariable}</ListItem>
            ))}
          </List>
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};

export default NameTemplateBody;
