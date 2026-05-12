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
  testIdPrefix: string;
};

const LocalHookReview: FC<LocalHookReviewProps> = ({ hookFieldId, hookLabel, testIdPrefix }) => {
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
            <DescriptionListDescription data-testid={`${testIdPrefix}-enabled`}>
              {t('True')}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {hooksFormFieldLabels[MigrationHookFieldId.HookRunnerImage]}
            </DescriptionListTerm>
            <DescriptionListDescription data-testid={`${testIdPrefix}-runner-image`}>
              {hookData[MigrationHookFieldId.HookRunnerImage] ?? t('None')}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {hooksFormFieldLabels[MigrationHookFieldId.ServiceAccount]}
            </DescriptionListTerm>
            <DescriptionListDescription data-testid={`${testIdPrefix}-service-account`}>
              {hookData[MigrationHookFieldId.ServiceAccount] ?? t('None')}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>
              {hooksFormFieldLabels[MigrationHookFieldId.AnsiblePlaybook]}
            </DescriptionListTerm>
            <DescriptionListDescription data-testid={`${testIdPrefix}-ansible-playbook`}>
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
          <DescriptionListDescription data-testid={`${testIdPrefix}-enabled`}>
            {t('False')}
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

export default LocalHookReview;
