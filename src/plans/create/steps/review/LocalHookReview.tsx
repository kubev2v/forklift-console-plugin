import type { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { Base64 } from 'js-base64';

import {
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Title,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { type HooksFormFieldId, MigrationHookFieldId } from '../migration-hooks/constants';
import { hooksFormFieldLabels } from '../migration-hooks/utils';

type LocalHookReviewProps = {
  hookFieldId: HooksFormFieldId;
  hookLabel: string;
};

const LocalHookReview: FC<LocalHookReviewProps> = ({ hookFieldId, hookLabel }) => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const hookData = useWatch({ control, name: hookFieldId });

  return (
    <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
      <Title headingLevel="h4">{hookLabel}</Title>

      {hookData[MigrationHookFieldId.EnableHook] ? (
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Enabled')}</DescriptionListTerm>
            <DescriptionListDescription>{t('True')}</DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {hooksFormFieldLabels[MigrationHookFieldId.HookRunnerImage]}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {hookData[MigrationHookFieldId.HookRunnerImage]}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {hooksFormFieldLabels[MigrationHookFieldId.ServiceAccount]}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {hookData[MigrationHookFieldId.ServiceAccount] ?? t('None')}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {hooksFormFieldLabels[MigrationHookFieldId.AnsiblePlaybook]}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {hookData[MigrationHookFieldId.AnsiblePlaybook] ? (
                <CodeBlock>
                  <CodeBlockCode>
                    {Base64.decode(hookData[MigrationHookFieldId.AnsiblePlaybook])}
                  </CodeBlockCode>
                </CodeBlock>
              ) : (
                t('None')
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </>
      ) : (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Enabled')}</DescriptionListTerm>
          <DescriptionListDescription>{t('False')}</DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

export default LocalHookReview;
