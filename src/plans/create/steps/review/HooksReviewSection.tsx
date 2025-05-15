import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title,
  useWizardContext,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks';
import { HooksFormFieldId, MigrationHookFieldId } from '../hooks/constants';
import { hooksFormFieldLabels } from '../hooks/utils';

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
      onEditClick={() => {
        goToStepById(PlanWizardStepId.Hooks);
      }}
    >
      <Grid hasGutter>
        <GridItem span={6}>
          <DescriptionList
            isHorizontal
            horizontalTermWidthModifier={{ default: '18ch' }}
            className="pf-v5-u-w-50"
          >
            <Title headingLevel="h4">{t('Pre migration hook')}</Title>

            {preMigration[MigrationHookFieldId.EnableHook] ? (
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
                    {preMigration[MigrationHookFieldId.HookRunnerImage]}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.AnsiblePlaybook]}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    {preMigration[MigrationHookFieldId.AnsiblePlaybook]}
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
        </GridItem>

        <GridItem span={6}>
          <DescriptionList
            isHorizontal
            horizontalTermWidthModifier={{ default: '18ch' }}
            className="pf-v5-u-w-50"
          >
            <Title headingLevel="h4">{t('Post migration hook')}</Title>

            {postMigration[MigrationHookFieldId.EnableHook] ? (
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
                    {postMigration[MigrationHookFieldId.HookRunnerImage]}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {hooksFormFieldLabels[MigrationHookFieldId.AnsiblePlaybook]}
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    {postMigration[MigrationHookFieldId.AnsiblePlaybook]}
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
        </GridItem>
      </Grid>
    </ExpandableReviewSection>
  );
};

export default HooksReviewSection;
