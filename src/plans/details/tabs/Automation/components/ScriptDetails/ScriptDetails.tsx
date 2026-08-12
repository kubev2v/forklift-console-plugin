import { type FC, useMemo, useState } from 'react';
import {
  GuestTypeLabels,
  ScriptTypeLabels,
} from 'src/plans/create/steps/customization-scripts/constants';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { COLLAPSED_MAX_LINES } from '../../constants';

type ScriptDetailsProps = {
  script: CustomScript;
};

const ScriptDetails: FC<ScriptDetailsProps> = ({ script }) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = useMemo((): string[] => script.content.split('\n'), [script.content]);
  const isLongContent = lines.length > COLLAPSED_MAX_LINES;
  const displayedContent =
    isLongContent && !isExpanded ? lines.slice(0, COLLAPSED_MAX_LINES).join('\n') : script.content;

  return (
    <Card isCompact>
      <CardBody>
        <DescriptionList columnModifier={{ default: '3Col' }}>
          <DetailsItem
            content={script.name}
            testId={`script-name-${script.name}`}
            title={t('Name')}
          />
          <DetailsItem
            content={GuestTypeLabels[script.guestType]}
            testId={`script-guest-type-${script.name}`}
            title={t('Guest type')}
          />
          <DetailsItem
            content={ScriptTypeLabels[script.scriptType]}
            testId={`script-type-${script.name}`}
            title={t('Script type')}
          />
        </DescriptionList>
        <DescriptionList className="pf-v6-u-mt-md">
          <DetailsItem
            content={
              <>
                <CodeBlock>
                  <CodeBlockCode>{displayedContent}</CodeBlockCode>
                </CodeBlock>
                {isLongContent && (
                  <Button
                    className="pf-v6-u-mt-sm"
                    isInline
                    onClick={() => {
                      setIsExpanded((prev) => !prev);
                    }}
                    variant={ButtonVariant.link}
                  >
                    {isExpanded ? t('Show less') : t('Show more')}
                  </Button>
                )}
              </>
            }
            testId={`script-content-${script.name}`}
            title={t('Content')}
          />
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default ScriptDetails;
