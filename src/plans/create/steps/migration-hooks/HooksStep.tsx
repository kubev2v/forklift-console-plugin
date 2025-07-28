import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form, FormSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import AnsiblePlaybookField from './AnsiblePlaybookField';
import { HooksFormFieldId } from './constants';
import EnableHookCheckbox from './EnableHookCheckbox';
import HookRunnerImageField from './HookRunnerImageField';

const HooksStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const [preMigrationHook, postMigrationHook] = useWatch({
    control,
    name: [HooksFormFieldId.PreMigration, HooksFormFieldId.PostMigration],
  });

  return (
    <WizardStepContainer
      title={planStepNames[PlanWizardStepId.Hooks]}
      description={t(
        'Hooks are contained in Ansible playbooks that can be run before or after the migration.',
      )}
    >
      <Form className="pf-v5-u-mt-md">
        <FormSection title={t('Pre migration hook')}>
          <EnableHookCheckbox fieldId={HooksFormFieldId.PreMigration} />

          {preMigrationHook?.enableHook && (
            <>
              <HookRunnerImageField fieldId={HooksFormFieldId.PreMigration} />
              <AnsiblePlaybookField fieldId={HooksFormFieldId.PreMigration} />
            </>
          )}
        </FormSection>

        <FormSection title={t('Post migration hook')} className="pf-v5-u-mt-md">
          <EnableHookCheckbox fieldId={HooksFormFieldId.PostMigration} />

          {postMigrationHook?.enableHook && (
            <>
              <HookRunnerImageField fieldId={HooksFormFieldId.PostMigration} />
              <AnsiblePlaybookField fieldId={HooksFormFieldId.PostMigration} />
            </>
          )}
        </FormSection>
      </Form>
    </WizardStepContainer>
  );
};

export default HooksStep;
