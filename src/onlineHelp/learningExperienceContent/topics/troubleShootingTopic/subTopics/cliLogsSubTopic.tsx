import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';
import { ForkliftTrans, t } from '@utils/i18n';

import {
  MUST_GATHER_EXAMPLE_URL,
  MUST_GATHER_URL,
  OPEN_CUSTOMER_SUPPORT_URL,
} from '../../utils/constants';

export const cliLogsSubTopic = (): LearningExperienceSubTopic => ({
  id: 'cli-logs',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'cli-logs-collect-information',
      title: t(
        'Lastly, you can review the ‘must-gather’ CLI logs to collect information about your cluster that is most likely needed for debugging purposes.',
      ),
    },
    {
      id: 'cli-logs-must-gather-tool',
      subListStyleType: ListStyleType.SQUARE,
      subTopics: () => [
        {
          id: 'cli-logs-must-gather-tool-navigate',
          title: t('Navigate to the directory where you want to store the must-gather data.'),
        },
        {
          id: 'cli-logs-must-gather-tool-run',
          title: (
            <ForkliftTrans>
              Run the command:
              <CodeBlock className="pf-v6-u-my-sm">
                <CodeBlockCode>{MUST_GATHER_EXAMPLE_URL}</CodeBlockCode>
              </CodeBlock>
              (But this won't be static; the UI should populate it as the image can change),
            </ForkliftTrans>
          ),
        },
        {
          id: 'cli-logs-must-gather-tool-additional-steps',
          subListStyleType: ListStyleType.CIRCLE,
          subTopics: () => [
            {
              id: 'cli-logs-must-gather-tool-compressed-file',
              title: t(
                'Create a compressed file from the must-gather directory that was just created in your working directory.',
              ),
            },
            {
              id: 'cli-logs-must-gather-tool-open-case',
              title: (
                <ForkliftTrans>
                  <ExternalLink href={OPEN_CUSTOMER_SUPPORT_URL} isInline>
                    Open a support case
                  </ExternalLink>{' '}
                  on your Red Hat Customer Portal and attach the compressed file.
                </ForkliftTrans>
              ),
            },
          ],
          title: t('If you want support from Red Hat, follow these additional steps:'),
        },
        {
          id: 'cli-logs-must-gather-tool-learn-more',
          title: (
            <ExternalLink href={MUST_GATHER_URL} isInline>
              {t('Learn more about the must-gather tool')}
            </ExternalLink>
          ),
        },
      ],
      title: t('To use the must-gather tool,'),
    },
  ],
  title: t("'must-gather' CLI logs"),
});
