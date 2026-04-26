import type { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { Base64 } from 'js-base64';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { HooksFormFieldId, MigrationHookFieldId } from '../migration-hooks/constants';
import { hooksFormFieldLabels } from '../migration-hooks/utils';

const HooksReviewSection: FC = () => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const [preMigration, postMigration] = useWatch({
    control,
    name: [HooksFormFieldId.PreMigration, HooksFormFieldId.PostMigration],
  });

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.Hooks]}
      testId="review-hooks-section"
      onEditClick={() => {
        goToStepById(PlanWizardStepId.Hooks);
      }}
    >
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXl' }}>
        <FlexItem>
          <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
            <Title headingLevel="h4">{t('Pre migration hook')}</Title>

            {preMigration[MigrationHookFieldId.EnableHook] ? (
              <>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Enabled')}</DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-pre-migration-hook-enabled">
                    {t('True')}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.HookRunnerImage]}
                  </DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-pre-migration-hook-runner-image">
                    {preMigration[MigrationHookFieldId.HookRunnerImage]}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.ServiceAccount]}
                  </DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-pre-migration-hook-service-account">
                    {preMigration[MigrationHookFieldId.ServiceAccount] ?? t('None')}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.AnsiblePlaybook]}
                  </DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-pre-migration-hook-ansible-playbook">
                    {preMigration[MigrationHookFieldId.AnsiblePlaybook] ? (
                      <CodeBlock>
                        <CodeBlockCode>
                          {Base64.decode(preMigration[MigrationHookFieldId.AnsiblePlaybook])}
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
                <DescriptionListDescription data-testid="review-pre-migration-hook-enabled">
                  {t('False')}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </FlexItem>

        <FlexItem>
          <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
            <Title headingLevel="h4">{t('Post migration hook')}</Title>

            {postMigration[MigrationHookFieldId.EnableHook] ? (
              <>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Enabled')}</DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-post-migration-hook-enabled">
                    {t('True')}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.HookRunnerImage]}
                  </DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-post-migration-hook-runner-image">
                    {postMigration[MigrationHookFieldId.HookRunnerImage]}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.ServiceAccount]}
                  </DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-post-migration-hook-service-account">
                    {postMigration[MigrationHookFieldId.ServiceAccount] ?? t('None')}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.AnsiblePlaybook]}
                  </DescriptionListTerm>
                  <DescriptionListDescription data-testid="review-post-migration-hook-ansible-playbook">
                    {postMigration[MigrationHookFieldId.AnsiblePlaybook] ? (
                      <CodeBlock>
                        <CodeBlockCode>
                          {Base64.decode(postMigration[MigrationHookFieldId.AnsiblePlaybook])}
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
                <DescriptionListDescription data-testid="review-post-migration-hook-enabled">
                  {t('False')}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </FlexItem>
      </Flex>
    </ExpandableReviewSection>
  );
};

export default HooksReviewSection;
