import { type FC, useState } from 'react';

import { CodeBlock, CodeBlockCode, ExpandableSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type EditVmNameTemplateVariablesProps = {
  allowedVariables: string[];
};

const EditVmNameTemplateVariables: FC<EditVmNameTemplateVariablesProps> = ({
  allowedVariables,
}) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      className="edit-vm-name-template-variables"
      isExpanded={isExpanded}
      onToggle={(_event, isSectionExpanded) => {
        setIsExpanded(isSectionExpanded);
      }}
      toggleText={t('View available variables')}
      toggleTextExpanded={t('Hide available variables')}
    >
      <CodeBlock>
        <CodeBlockCode>{allowedVariables.join('\n')}</CodeBlockCode>
      </CodeBlock>
    </ExpandableSection>
  );
};

export default EditVmNameTemplateVariables;
