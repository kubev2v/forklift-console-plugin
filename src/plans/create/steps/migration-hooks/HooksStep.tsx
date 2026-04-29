import { type FC, useCallback, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form, FormSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import AapConnectionSection from './components/AapConnectionSection';
import HookSourceRadio from './components/HookSourceRadio';
import JobTemplateAssignment from './components/JobTemplateAssignment';
import AnsiblePlaybookField from './AnsiblePlaybookField';
import { AapFormFieldId, HOOK_SOURCE_AAP, HOOK_SOURCE_LOCAL, HooksFormFieldId } from './constants';
import EnableHookCheckbox from './EnableHookCheckbox';
import HookRunnerImageField from './HookRunnerImageField';
import HookServiceAccountField from './HookServiceAccountField';

const HooksStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const [preMigrationHook, postMigrationHook, hookSource] = useWatch({
    control,
    name: [
      HooksFormFieldId.PreMigration,
      HooksFormFieldId.PostMigration,
      AapFormFieldId.HookSource,
    ],
  });

  const [aapJobTemplates, setAapJobTemplates] = useState<AapJobTemplate[]>([]);

  useEffect(() => {
    if (hookSource !== HOOK_SOURCE_AAP) {
      setAapJobTemplates([]);
    }
  }, [hookSource]);

  const handleAapConnected = useCallback((templates: AapJobTemplate[]): void => {
    setAapJobTemplates(templates);
  }, []);

  return (
    <WizardStepContainer
      title={planStepNames[PlanWizardStepId.Hooks]}
      description={
        <>
          <p>
            {t(
              'Hooks allow you to run Ansible playbooks or Ansible Automation Platform job templates before or after the migration.',
            )}
          </p>
          <p>{t('Hooks are applied to all virtual machines in the plan.')}</p>
        </>
      }
    >
      <Form className="pf-v6-u-mt-md">
        <HookSourceRadio />

        {hookSource === HOOK_SOURCE_LOCAL && (
          <>
            <FormSection title={t('Pre migration hook')}>
              <EnableHookCheckbox fieldId={HooksFormFieldId.PreMigration} />

              {preMigrationHook?.enableHook && (
                <>
                  <HookRunnerImageField fieldId={HooksFormFieldId.PreMigration} />
                  <HookServiceAccountField fieldId={HooksFormFieldId.PreMigration} />
                  <AnsiblePlaybookField fieldId={HooksFormFieldId.PreMigration} />
                </>
              )}
            </FormSection>

            <FormSection title={t('Post migration hook')} className="pf-v6-u-mt-md">
              <EnableHookCheckbox fieldId={HooksFormFieldId.PostMigration} />

              {postMigrationHook?.enableHook && (
                <>
                  <HookRunnerImageField fieldId={HooksFormFieldId.PostMigration} />
                  <HookServiceAccountField fieldId={HooksFormFieldId.PostMigration} />
                  <AnsiblePlaybookField fieldId={HooksFormFieldId.PostMigration} />
                </>
              )}
            </FormSection>
          </>
        )}

        {hookSource === HOOK_SOURCE_AAP && (
          <>
            <AapConnectionSection onConnected={handleAapConnected} />
            {!isEmpty(aapJobTemplates) && <JobTemplateAssignment jobTemplates={aapJobTemplates} />}
          </>
        )}
      </Form>
    </WizardStepContainer>
  );
};

export default HooksStep;
